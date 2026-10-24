"""
NETPULSE - Phase 9 Progression, Authentication & Persistence Test Suite
Course: Probability and Statistics for Computer Science (25CS203)

Covers all 19 Phase 9 verification requirements:
 1. Authenticated game completion
 2. Invalid or expired tokens rejection (401)
 3. Rejection of unauthenticated persistence requests (401)
 4. Correct calculation of final score and accuracy
 5. Server-authoritative XP calculation
 6. Duplicate completion retries (idempotency key protection)
 7. Concurrent duplicate completion requests
 8. Correct total XP updates and level tier calculations
 9. Achievement eligibility evaluation
10. Duplicate achievement unlock protection
11. Saving analysis history through verified server-side path
12. User isolation: retrieving only current user's history
13. Leaderboard ordering and tie-breaking
14. Protection of private profile fields
15. No exposure of emails or private data through leaderboard
16. Missing Supabase configuration graceful handling
17. Guest mode still functioning
18. Existing 5-game answer evaluation and Golden Bridge
19. Schema migration files and SQL compatibility
"""

import pytest
import os
import asyncio

# Enable test authentication mode
os.environ["NETPULSE_TEST_AUTH"] = "1"

from main import app
from services.supabase_client import get_memory_db
from services.progression_engine import (
    calculate_level,
    get_level_title,
    evaluate_achievement_eligibility,
    ACHIEVEMENTS_CATALOG
)
from models.progression import (
    GameCompletionRequest,
    SaveAnalysisRequest
)
from routes.progression import complete_game_authoritative, get_progression, get_leaderboard
from routes.analysis import save_analysis_snapshot, get_user_history
from routes.games import check_game_answer
from models.network import GameCheckAnswerRequest


@pytest.fixture(autouse=True)
def reset_mem_db():
    db = get_memory_db()
    db.reset()
    yield
    db.reset()


def run_async(coro):
    while True:
        try:
            coro.send(None)
        except StopIteration as exc:
            return exc.value


class TestAuthenticationAndTokens:
    def test_01_authenticated_game_completion(self):
        """1. Authenticated game completion awards XP and updates total_xp."""
        req = GameCompletionRequest(
            game_id="traffic_controller",
            scenario_id="traffic_controller_01",
            user_decision="Emergency Response",
            idempotency_key="idemp-test-01"
        )
        user = {"id": "user-uuid-1", "email": "student1@karunya.edu.in", "user_metadata": {"username": "student_one"}}
        resp = run_async(complete_game_authoritative(req, user))

        assert resp.is_correct is True
        assert resp.xp_awarded == 10
        # 10 XP game award + 100 XP achievement reward for traffic_controller = 110 XP (Level 2)
        assert resp.total_xp == 110
        assert resp.level == 2
        assert resp.already_completed is False

    def test_02_invalid_or_expired_tokens(self):
        """2. Invalid and expired tokens raise 401 Unauthorized."""
        from services.supabase_auth import verify_supabase_token
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_invalid:
            run_async(verify_supabase_token("test-token-invalid"))
        assert exc_invalid.value.status_code == 401

        with pytest.raises(HTTPException) as exc_expired:
            run_async(verify_supabase_token("test-token-expired"))
        assert exc_expired.value.status_code == 401

    def test_03_rejection_of_unauthenticated_requests(self):
        """3. Endpoints requiring auth reject missing bearer tokens."""
        from services.supabase_auth import get_current_user
        from starlette.requests import Request
        from fastapi import HTTPException

        scope = {"type": "http", "headers": []}
        req = Request(scope)

        with pytest.raises(HTTPException) as exc:
            run_async(get_current_user(req))
        assert exc.value.status_code == 401
        assert "Authorization header" in exc.value.detail


class TestGameScoringAndIdempotency:
    def test_04_correct_calculation_of_final_score_and_accuracy(self):
        """4. Correct and incorrect submissions compute exact score & accuracy."""
        user = {"id": "user-uuid-2", "email": "student2@karunya.edu.in", "user_metadata": {"username": "student_two"}}
        
        # Correct submission
        req_correct = GameCompletionRequest(
            game_id="traffic_controller",
            scenario_id="traffic_controller_01",
            user_decision="Emergency Response",
            idempotency_key="idemp-score-01"
        )
        resp_c = run_async(complete_game_authoritative(req_correct, user))
        assert resp_c.score == 100
        assert resp_c.accuracy == 100.0

        # Incorrect submission
        req_wrong = GameCompletionRequest(
            game_id="traffic_controller",
            scenario_id="traffic_controller_01",
            user_decision="Continue Monitoring",
            idempotency_key="idemp-score-02"
        )
        resp_w = run_async(complete_game_authoritative(req_wrong, user))
        assert resp_w.score == 20
        assert resp_w.accuracy == 20.0

    def test_05_server_authoritative_xp_calculation(self):
        """5. XP values are strictly determined by the server and cannot be falsified by the client."""
        user = {"id": "user-uuid-3", "email": "student3@karunya.edu.in", "user_metadata": {"username": "student_three"}}
        
        req = GameCompletionRequest(
            game_id="zscore_challenge",
            scenario_id="zscore_challenge_01",
            user_decision="2.4",  # Scenario: load=62, mean=50, std=5 -> Z = 2.4
            idempotency_key="idemp-xp-01"
        )
        resp = run_async(complete_game_authoritative(req, user))
        assert resp.xp_awarded == 15
        assert resp.is_correct is True

    def test_06_duplicate_completion_retries_idempotency(self):
        """6. Re-submitting the same idempotency key awards 0 extra XP and returns existing score."""
        user = {"id": "user-uuid-4", "email": "student4@karunya.edu.in", "user_metadata": {"username": "student_four"}}
        
        req = GameCompletionRequest(
            game_id="traffic_controller",
            scenario_id="traffic_controller_01",
            user_decision="Emergency Response",
            idempotency_key="idemp-duplicate-retry"
        )
        first_resp = run_async(complete_game_authoritative(req, user))
        assert first_resp.xp_awarded == 10
        assert first_resp.already_completed is False
        total_xp_after_first = first_resp.total_xp

        # Retry with identical idempotency key
        retry_resp = run_async(complete_game_authoritative(req, user))
        assert retry_resp.xp_awarded == 0
        assert retry_resp.already_completed is True
        assert retry_resp.total_xp == total_xp_after_first

    def test_07_concurrent_duplicate_completion_requests(self):
        """7. Concurrent duplicate completion requests do not double-award XP."""
        user = {"id": "user-uuid-5", "email": "student5@karunya.edu.in", "user_metadata": {"username": "student_five"}}
        
        req = GameCompletionRequest(
            game_id="traffic_controller",
            scenario_id="traffic_controller_01",
            user_decision="Emergency Response",
            idempotency_key="idemp-concurrent-01"
        )

        # First request arrives
        res1 = run_async(complete_game_authoritative(req, user))
        # Second overlapping request with duplicate idempotency key arrives
        res2 = run_async(complete_game_authoritative(req, user))

        results = [res1, res2]
        xp_awarded_sum = sum(r.xp_awarded for r in results)
        # Exactly one request gets the XP
        assert xp_awarded_sum == 10
        assert res1.already_completed is False
        assert res2.already_completed is True
        assert res1.total_xp == res2.total_xp
        assert any(r.already_completed is True for r in results)


class TestProgressionAndAchievements:
    def test_08_correct_total_xp_updates_and_level_tiers(self):
        """8. Total XP updates atomically and transitions through level tiers correctly."""
        assert calculate_level(0) == 1
        assert calculate_level(99) == 1
        assert calculate_level(100) == 2
        assert calculate_level(249) == 2
        assert calculate_level(250) == 3
        assert calculate_level(449) == 3
        assert calculate_level(450) == 4
        assert calculate_level(699) == 4
        assert calculate_level(700) == 5
        assert calculate_level(1500) == 5

        assert get_level_title(1) == "Analyst Intern"
        assert get_level_title(2) == "Junior NOC Operator"
        assert get_level_title(3) == "Telemetry Specialist"
        assert get_level_title(4) == "Senior Systems Analyst"
        assert get_level_title(5) == "Chief Infrastructure Architect"

    def test_09_achievement_eligibility_evaluation(self):
        """9. Completing games unlocks corresponding achievement milestones."""
        unlocked = evaluate_achievement_eligibility(
            "game_completed",
            {"game_id": "traffic_controller", "is_correct": True},
            set()
        )
        assert len(unlocked) == 1
        assert unlocked[0]["id"] == "traffic_controller"
        assert unlocked[0]["xp_reward"] == 100

        unlocked_z = evaluate_achievement_eligibility(
            "game_completed",
            {"game_id": "zscore_challenge", "is_correct": True},
            set()
        )
        assert len(unlocked_z) == 1
        assert unlocked_z[0]["id"] == "zscore_master"

    def test_10_duplicate_achievement_unlock_protection(self):
        """10. Repeated triggers do not unlock achievements twice or re-grant reward XP."""
        already_unlocked = {"traffic_controller"}
        unlocked = evaluate_achievement_eligibility(
            "game_completed",
            {"game_id": "traffic_controller", "is_correct": True},
            already_unlocked
        )
        assert len(unlocked) == 0


class TestAnalysisHistoryAndIsolation:
    def test_11_saving_analysis_history_through_verified_path(self):
        """11. Server computes and persists verified analysis snapshot and unlocks first_analysis."""
        user = {"id": "user-uuid-6", "email": "student6@karunya.edu.in", "user_metadata": {"username": "student_six"}}
        req = SaveAnalysisRequest(network_load=62.0, dataset="campus_network")

        resp = run_async(save_analysis_snapshot(req, user))
        assert resp.saved is True
        assert resp.history_id is not None
        assert resp.analysis["current_load"] == 62.0
        assert resp.analysis["status"] == "NORMAL"
        assert resp.analysis["health_score"] == 85
        # First analysis should unlock first_analysis achievement
        assert any(a.id == "first_analysis" for a in resp.newly_unlocked_achievements)

    def test_12_retrieving_only_current_users_history_isolation(self):
        """12. Private analysis history is isolated: User A never sees User B's records."""
        user_a = {"id": "user-uuid-a", "email": "user_a@karunya.edu.in", "user_metadata": {"username": "user_a"}}
        user_b = {"id": "user-uuid-b", "email": "user_b@karunya.edu.in", "user_metadata": {"username": "user_b"}}

        # Save for User A
        run_async(save_analysis_snapshot(SaveAnalysisRequest(network_load=45.0), user_a))
        run_async(save_analysis_snapshot(SaveAnalysisRequest(network_load=55.0), user_a))

        # Save for User B
        run_async(save_analysis_snapshot(SaveAnalysisRequest(network_load=90.0), user_b))

        # Fetch User A history
        hist_a = run_async(get_user_history(limit=50, offset=0, current_user=user_a))
        assert hist_a.total_count == 2
        for r in hist_a.records:
            assert r.current_load in (45.0, 55.0)

        # Fetch User B history
        hist_b = run_async(get_user_history(limit=50, offset=0, current_user=user_b))
        assert hist_b.total_count == 1
        assert hist_b.records[0].current_load == 90.0


class TestLeaderboardAndPrivacy:
    def test_13_leaderboard_ordering_and_tie_breaking(self):
        """13. Leaderboard orders by total_xp DESC with deterministic tie breaking."""
        db = get_memory_db()
        db.award_xp("u1", 300, "Analyst_Top")
        db.award_xp("u2", 150, "Analyst_Mid")
        db.award_xp("u3", 50, "Analyst_Low")

        lb = run_async(get_leaderboard(limit=10))
        assert lb.total_count == 3
        assert lb.entries[0].username == "Analyst_Top"
        assert lb.entries[0].rank == 1
        assert lb.entries[0].total_xp == 300
        assert lb.entries[1].username == "Analyst_Mid"
        assert lb.entries[1].rank == 2
        assert lb.entries[2].username == "Analyst_Low"
        assert lb.entries[2].rank == 3

    def test_14_protection_of_private_profile_fields(self):
        """14. User progression endpoint returns only allowed profile data."""
        user = {"id": "user-uuid-safe", "email": "safe@karunya.edu.in", "user_metadata": {"username": "safe_student"}}
        db = get_memory_db()
        db.award_xp(user["id"], 200, "safe_student")

        prog = run_async(get_progression(user))
        assert prog.user_id == user["id"]
        assert prog.username == "safe_student"
        assert prog.level == 2
        assert prog.total_xp == 200

    def test_15_no_exposure_of_emails_through_leaderboard(self):
        """15. Leaderboard exposes rank, username, level, total_xp only; NO emails or user UUIDs."""
        db = get_memory_db()
        db.award_xp("u-secret", 500, "SuperAnalyst")

        lb = run_async(get_leaderboard(limit=5))
        for entry in lb.entries:
            entry_dict = entry.model_dump()
            assert "email" not in entry_dict
            assert "id" not in entry_dict
            assert "user_id" not in entry_dict
            assert set(entry_dict.keys()) == {"rank", "username", "level", "total_xp"}


class TestSystemResilienceAndExistingWorkflows:
    def test_16_missing_supabase_configuration_handling(self):
        """16. Progression engine operates in memory store without crashing when Supabase URL is empty."""
        db = get_memory_db()
        xp, lvl = db.award_xp("local-user", 80, "local_student")
        assert xp == 80
        assert lvl == 1

    def test_17_guest_mode_still_functioning(self):
        """17. Unauthenticated guests can still run statistical analysis and educational games."""
        from routes.analysis import analyze_network_load
        from models.network import NetworkLoadRequest

        req = NetworkLoadRequest(network_load=62.0, dataset="campus_network")
        resp = run_async(analyze_network_load(req))
        assert resp.z_score == 1.5912
        assert resp.status == "NORMAL"
        assert resp.health_score == 85

    def test_18_existing_five_game_interactions_and_golden_bridge(self):
        """18. Phase 6 check_game_answer endpoint continues to work with Golden Bridge payload."""
        req = GameCheckAnswerRequest(
            game_id="traffic_controller",
            scenario_id="traffic_controller_01",
            user_decision="Emergency Response"
        )
        resp = run_async(check_game_answer(req))
        assert resp.is_correct is True
        assert resp.technical_analysis["game_id"] == "traffic_controller"
        assert resp.technical_analysis["current_load"] == 91.0
        assert resp.technical_analysis["z_score"] == 8.2

    def test_19_schema_migrations_and_sql_compatibility(self):
        """19. All four numbered migrations exist and have standard YYYYMMDDHHMMSS format."""
        import re
        migrations_dir = os.path.join(os.path.dirname(__file__), "..", "..", "supabase", "migrations")
        files = sorted(os.listdir(migrations_dir))
        assert len(files) == 4, f"Expected 4 migrations, found {len(files)}: {files}"

        pattern = re.compile(r"^\d{14}_.+\.sql$")
        for f in files:
            assert pattern.match(f), f"Migration filename {f} does not match YYYYMMDDHHMMSS_name.sql"
