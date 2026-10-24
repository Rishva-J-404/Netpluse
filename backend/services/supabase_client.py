"""
NETPULSE - Authoritative Database Persistence Client
Course: Probability and Statistics for Computer Science (25CS203)
"""

import os
import httpx
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

from services.progression_engine import (
    calculate_level,
    evaluate_achievement_eligibility,
    ACHIEVEMENTS_CATALOG
)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_ANON_KEY", ""))

# -------------------------------------------------------------------------
# In-Memory Deterministic Database Store for Testing and Offline Mode
# -------------------------------------------------------------------------
class MemoryDatabase:
    def __init__(self):
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self.game_results: List[Dict[str, Any]] = []
        self.user_achievements: List[Dict[str, Any]] = []
        self.analysis_history: List[Dict[str, Any]] = []
        self.achievements: List[Dict[str, Any]] = list(ACHIEVEMENTS_CATALOG)

    def reset(self):
        self.profiles.clear()
        self.game_results.clear()
        self.user_achievements.clear()
        self.analysis_history.clear()

    def get_or_create_profile(self, user_id: str, username: str = "analyst") -> Dict[str, Any]:
        if user_id not in self.profiles:
            self.profiles[user_id] = {
                "id": user_id,
                "username": username,
                "avatar_url": "default_avatar",
                "level": 1,
                "total_xp": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        return self.profiles[user_id]

    def award_xp(self, user_id: str, xp_to_add: int, username: str = "analyst") -> Tuple[int, int]:
        prof = self.get_or_create_profile(user_id, username)
        prof["total_xp"] = max(0, prof["total_xp"] + max(0, xp_to_add))
        prof["level"] = calculate_level(prof["total_xp"])
        prof["updated_at"] = datetime.now(timezone.utc).isoformat()
        return prof["total_xp"], prof["level"]


_mem_db = MemoryDatabase()


def get_memory_db() -> MemoryDatabase:
    return _mem_db


# -------------------------------------------------------------------------
# Authoritative Persistence Functions
# -------------------------------------------------------------------------

async def record_authoritative_game_completion(
    user_id: str,
    username: str,
    game_id: str,
    scenario_id: str,
    score: int,
    accuracy: float,
    xp_earned: int,
    is_correct: bool,
    idempotency_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Persists game completion, updates total XP, and evaluates achievement unlocks.
    Guarantees idempotency: duplicate idempotency_key returns previous result with zero extra XP.
    """
    # 1. Use Memory DB if offline/testing or Supabase unconfigured
    if not SUPABASE_URL or os.getenv("NETPULSE_TEST_AUTH", "0") == "1":
        # Check idempotency
        if idempotency_key:
            existing = next(
                (r for r in _mem_db.game_results if r.get("user_id") == user_id and r.get("idempotency_key") == idempotency_key),
                None
            )
            if existing:
                prof = _mem_db.get_or_create_profile(user_id, username)
                return {
                    "already_completed": True,
                    "score": existing["score"],
                    "accuracy": existing["accuracy"],
                    "xp_awarded": 0,
                    "total_xp": prof["total_xp"],
                    "level": prof["level"],
                    "newly_unlocked_achievements": []
                }

        # Record result
        record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "game_id": game_id,
            "scenario_id": scenario_id,
            "score": score,
            "accuracy": accuracy,
            "xp_earned": xp_earned,
            "idempotency_key": idempotency_key,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }
        _mem_db.game_results.append(record)

        # Award XP
        new_xp, new_lvl = _mem_db.award_xp(user_id, xp_earned, username)

        # Evaluate achievements
        user_unlocked_ids = {
            ua["achievement_id"] for ua in _mem_db.user_achievements if ua["user_id"] == user_id
        }
        newly_unlocked = evaluate_achievement_eligibility(
            "game_completed",
            {"game_id": game_id, "is_correct": is_correct},
            user_unlocked_ids
        )

        for ach in newly_unlocked:
            _mem_db.user_achievements.append({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "achievement_id": ach["id"],
                "unlocked_at": datetime.now(timezone.utc).isoformat()
            })
            # Award achievement XP bonus
            new_xp, new_lvl = _mem_db.award_xp(user_id, ach["xp_reward"], username)

        return {
            "already_completed": False,
            "score": score,
            "accuracy": accuracy,
            "xp_awarded": xp_earned,
            "total_xp": new_xp,
            "level": new_lvl,
            "newly_unlocked_achievements": newly_unlocked
        }

    # 2. Real Supabase PostgREST Connection
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Idempotency check via PostgREST
        if idempotency_key:
            chk_url = f"{SUPABASE_URL}/rest/v1/game_results?user_id=eq.{user_id}&idempotency_key=eq.{idempotency_key}&select=*"
            chk_resp = await client.get(chk_url, headers=headers)
            if chk_resp.status_code == 200 and len(chk_resp.json()) > 0:
                existing = chk_resp.json()[0]
                # Get current profile
                p_resp = await client.get(f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=*", headers=headers)
                prof = p_resp.json()[0] if p_resp.status_code == 200 and len(p_resp.json()) > 0 else {"total_xp": 0, "level": 1}
                return {
                    "already_completed": True,
                    "score": existing["score"],
                    "accuracy": existing["accuracy"],
                    "xp_awarded": 0,
                    "total_xp": prof["total_xp"],
                    "level": prof["level"],
                    "newly_unlocked_achievements": []
                }

        # Insert game result
        record = {
            "user_id": user_id,
            "game_id": game_id,
            "scenario_id": scenario_id,
            "score": score,
            "accuracy": accuracy,
            "xp_earned": xp_earned,
            "idempotency_key": idempotency_key
        }
        ins_resp = await client.post(f"{SUPABASE_URL}/rest/v1/game_results", json=record, headers=headers)
        if ins_resp.status_code not in (200, 201):
            raise RuntimeError(f"Database error saving game result: {ins_resp.text}")

        # Update progression via award_user_progression RPC or atomic update
        rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/award_user_progression"
        rpc_resp = await client.post(rpc_url, json={"p_user_id": user_id, "p_xp_to_add": xp_earned}, headers=headers)
        if rpc_resp.status_code == 200 and len(rpc_resp.json()) > 0:
            prog_data = rpc_resp.json()[0]
            new_xp = prog_data["new_total_xp"]
            new_lvl = prog_data["new_level"]
        else:
            # Fallback direct query
            p_resp = await client.get(f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=*", headers=headers)
            prof = p_resp.json()[0] if p_resp.status_code == 200 and len(p_resp.json()) > 0 else {"total_xp": 0}
            new_xp = prof.get("total_xp", 0) + xp_earned
            new_lvl = calculate_level(new_xp)
            await client.patch(
                f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}",
                json={"total_xp": new_xp, "level": new_lvl, "updated_at": datetime.now(timezone.utc).isoformat()},
                headers=headers
            )

        # Check existing unlocked achievements
        ach_url = f"{SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.{user_id}&select=achievement_id"
        ach_resp = await client.get(ach_url, headers=headers)
        user_unlocked_ids = {r["achievement_id"] for r in ach_resp.json()} if ach_resp.status_code == 200 else set()

        newly_unlocked = evaluate_achievement_eligibility(
            "game_completed",
            {"game_id": game_id, "is_correct": is_correct},
            user_unlocked_ids
        )

        for ach in newly_unlocked:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/user_achievements",
                json={"user_id": user_id, "achievement_id": ach["id"]},
                headers=headers
            )
            # Award achievement bonus XP
            await client.post(rpc_url, json={"p_user_id": user_id, "p_xp_to_add": ach["xp_reward"]}, headers=headers)
            new_xp += ach["xp_reward"]
            new_lvl = calculate_level(new_xp)

        return {
            "already_completed": False,
            "score": score,
            "accuracy": accuracy,
            "xp_awarded": xp_earned,
            "total_xp": new_xp,
            "level": new_lvl,
            "newly_unlocked_achievements": newly_unlocked
        }


async def save_authoritative_analysis(
    user_id: str,
    username: str,
    analysis_data: Dict[str, Any]
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Saves an authoritative analysis snapshot to analysis_history and checks first_analysis badge.
    """
    record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "dataset_name": analysis_data.get("dataset_name", "campus_network"),
        "mean": float(analysis_data["mean"]),
        "variance": float(analysis_data["variance"]),
        "std_deviation": float(analysis_data["std_dev"]),
        "current_load": float(analysis_data["current_load"]),
        "z_score": float(analysis_data["z_score"]),
        "probability": float(analysis_data["probability"]),
        "status": str(analysis_data["status"]),
        "health_score": int(analysis_data["health_score"]),
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    if not SUPABASE_URL or os.getenv("NETPULSE_TEST_AUTH", "0") == "1":
        _mem_db.analysis_history.append(record)
        user_unlocked_ids = {
            ua["achievement_id"] for ua in _mem_db.user_achievements if ua["user_id"] == user_id
        }
        newly_unlocked = evaluate_achievement_eligibility("analysis_saved", {}, user_unlocked_ids)
        for ach in newly_unlocked:
            _mem_db.user_achievements.append({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "achievement_id": ach["id"],
                "unlocked_at": datetime.now(timezone.utc).isoformat()
            })
            _mem_db.award_xp(user_id, ach["xp_reward"], username)

        return record["id"], newly_unlocked

    # Remote Supabase execution
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        ins_resp = await client.post(f"{SUPABASE_URL}/rest/v1/analysis_history", json=record, headers=headers)
        if ins_resp.status_code not in (200, 201):
            raise RuntimeError(f"Database error saving analysis snapshot: {ins_resp.text}")

        ach_resp = await client.get(f"{SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.{user_id}&select=achievement_id", headers=headers)
        user_unlocked_ids = {r["achievement_id"] for r in ach_resp.json()} if ach_resp.status_code == 200 else set()

        newly_unlocked = evaluate_achievement_eligibility("analysis_saved", {}, user_unlocked_ids)
        for ach in newly_unlocked:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/user_achievements",
                json={"user_id": user_id, "achievement_id": ach["id"]},
                headers=headers
            )
            # Award achievement XP
            rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/award_user_progression"
            await client.post(rpc_url, json={"p_user_id": user_id, "p_xp_to_add": ach["xp_reward"]}, headers=headers)

        return record["id"], newly_unlocked


async def get_user_analysis_history(user_id: str, limit: int = 50, offset: int = 0) -> Tuple[List[Dict[str, Any]], int]:
    """
    Retrieves analysis history strictly for the authenticated user ID.
    Enforces user data privacy: never returns another user's rows.
    """
    if not SUPABASE_URL or os.getenv("NETPULSE_TEST_AUTH", "0") == "1":
        user_records = [r for r in _mem_db.analysis_history if r.get("user_id") == user_id]
        user_records.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        total = len(user_records)
        paginated = user_records[offset: offset + limit]
        return paginated, total

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Prefer": "count=exact"
    }
    url = f"{SUPABASE_URL}/rest/v1/analysis_history?user_id=eq.{user_id}&order=created_at.desc&limit={limit}&offset={offset}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code == 200:
            content_range = resp.headers.get("content-range", "")
            total = int(content_range.split("/")[-1]) if "/" in content_range and content_range.split("/")[-1].isdigit() else len(resp.json())
            return resp.json(), total
        return [], 0


async def get_authoritative_leaderboard(limit: int = 50) -> List[Dict[str, Any]]:
    """
    Retrieves global rankings using get_leaderboard RPC or public profiles view.
    Exposes only approved fields: rank, username, level, total_xp.
    """
    if not SUPABASE_URL or os.getenv("NETPULSE_TEST_AUTH", "0") == "1":
        profiles_list = list(_mem_db.profiles.values())
        # Filter profiles with progression
        active = [p for p in profiles_list if p.get("total_xp", 0) > 0 or p.get("level", 1) > 1]
        # Sort by total_xp DESC, updated_at ASC, id ASC (deterministic tie-breaking)
        active.sort(key=lambda p: (-p.get("total_xp", 0), p.get("updated_at", ""), p.get("id", "")))
        active = active[:limit]
        leaderboard = []
        for idx, prof in enumerate(active, start=1):
            leaderboard.append({
                "rank": idx,
                "username": prof.get("username", f"Analyst_{idx}"),
                "level": prof.get("level", 1),
                "total_xp": prof.get("total_xp", 0)
            })
        return leaderboard

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/get_leaderboard"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(rpc_url, json={"limit_count": limit}, headers=headers)
        if resp.status_code == 200:
            return resp.json()
        # Fallback to direct query on profiles
        fallback_url = f"{SUPABASE_URL}/rest/v1/profiles?select=username,level,total_xp&order=total_xp.desc&limit={limit}"
        f_resp = await client.get(fallback_url, headers=headers)
        if f_resp.status_code == 200:
            rows = f_resp.json()
            return [{"rank": i + 1, "username": r["username"], "level": r["level"], "total_xp": r["total_xp"]} for i, r in enumerate(rows)]
        return []


async def get_user_progression_summary(user_id: str, username: str = "analyst") -> Dict[str, Any]:
    """
    Fetches the verified progression snapshot for the profile page and user stats.
    """
    if not SUPABASE_URL or os.getenv("NETPULSE_TEST_AUTH", "0") == "1":
        prof = _mem_db.get_or_create_profile(user_id, username)
        games_count = sum(1 for g in _mem_db.game_results if g.get("user_id") == user_id)
        user_achs = [ua["achievement_id"] for ua in _mem_db.user_achievements if ua.get("user_id") == user_id]
        analyses_count = sum(1 for a in _mem_db.analysis_history if a.get("user_id") == user_id)

        return {
            "user_id": user_id,
            "username": prof["username"],
            "level": prof["level"],
            "total_xp": prof["total_xp"],
            "games_completed_count": games_count,
            "achievements_count": len(user_achs),
            "analyses_count": analyses_count,
            "unlocked_achievements": user_achs
        }

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        p_resp = await client.get(f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=*", headers=headers)
        prof = p_resp.json()[0] if p_resp.status_code == 200 and len(p_resp.json()) > 0 else {"username": username, "level": 1, "total_xp": 0}

        g_resp = await client.get(f"{SUPABASE_URL}/rest/v1/game_results?user_id=eq.{user_id}&select=id", headers=headers)
        games_count = len(g_resp.json()) if g_resp.status_code == 200 else 0

        a_resp = await client.get(f"{SUPABASE_URL}/rest/v1/user_achievements?user_id=eq.{user_id}&select=achievement_id", headers=headers)
        user_achs = [r["achievement_id"] for r in a_resp.json()] if a_resp.status_code == 200 else []

        h_resp = await client.get(f"{SUPABASE_URL}/rest/v1/analysis_history?user_id=eq.{user_id}&select=id", headers=headers)
        analyses_count = len(h_resp.json()) if h_resp.status_code == 200 else 0

        return {
            "user_id": user_id,
            "username": prof.get("username", username),
            "level": prof.get("level", 1),
            "total_xp": prof.get("total_xp", 0),
            "games_completed_count": games_count,
            "achievements_count": len(user_achs),
            "analyses_count": analyses_count,
            "unlocked_achievements": user_achs
        }
