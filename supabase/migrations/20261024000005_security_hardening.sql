-- ====================================================================
-- NETPULSE MIGRATION 005: Security Hardening & Function Permission Lockdown
-- Course: Probability and Statistics for Computer Science (25CS203)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. XP-Award Function Permission Lockdown
-- Restrict execution strictly to service_role (trusted backend).
-- Prevents untrusted browser clients from invoking award_user_progression
-- directly via PostgREST RPC with arbitrary user IDs or XP values.
-- --------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.award_user_progression(uuid, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_user_progression(uuid, int) FROM anon;
REVOKE EXECUTE ON FUNCTION public.award_user_progression(uuid, int) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.award_user_progression(uuid, int) TO service_role;

-- --------------------------------------------------------------------
-- 2. Direct Profile Progression Immutability Guard
-- Prevents authenticated users from altering total_xp, level, or id
-- through direct table UPDATE queries via PostgREST.
-- Only allows user updates to approved fields: username and avatar_url.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_profile_progression_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If update is initiated by a client role (authenticated or anon)
    IF current_user IN ('authenticated', 'anon') THEN
        -- Prevent unauthorized tampering with total_xp or level
        IF NEW.total_xp IS DISTINCT FROM OLD.total_xp THEN
            RAISE EXCEPTION 'Forbidden: total_xp cannot be modified directly. XP must be earned through verified backend game completions.';
        END IF;

        IF NEW.level IS DISTINCT FROM OLD.level THEN
            RAISE EXCEPTION 'Forbidden: level cannot be modified directly. Level is computed from verified XP.';
        END IF;

        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Forbidden: User identity (id) is immutable.';
        END IF;

        -- Ensure created_at cannot be altered
        IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
            NEW.created_at = OLD.created_at;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_profile_progression ON public.profiles;
CREATE TRIGGER trigger_protect_profile_progression
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_profile_progression_immutability();

-- --------------------------------------------------------------------
-- 3. Leaderboard Function Hardening
-- Ensures safe search_path, NULL-safe limit bounds, and explicit permissions
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count int DEFAULT 50)
RETURNS TABLE (
    rank bigint,
    username text,
    level integer,
    total_xp integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT
        ROW_NUMBER() OVER (ORDER BY total_xp DESC, updated_at ASC, id ASC) AS rank,
        username,
        level,
        total_xp
    FROM public.profiles
    WHERE total_xp > 0 OR level > 1
    ORDER BY total_xp DESC, updated_at ASC, id ASC
    LIMIT LEAST(GREATEST(COALESCE(limit_count, 50), 1), 100);
$$;

REVOKE EXECUTE ON FUNCTION public.get_leaderboard(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(int) TO anon, authenticated, service_role;

-- --------------------------------------------------------------------
-- 4. Pure Level Calculation Function Hardening
-- Adds explicit search_path and COALESCE protection for NULL XP inputs
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_level(xp int)
RETURNS int
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
    SELECT CASE
        WHEN COALESCE(xp, 0) >= 700 THEN 5
        WHEN COALESCE(xp, 0) >= 450 THEN 4
        WHEN COALESCE(xp, 0) >= 250 THEN 3
        WHEN COALESCE(xp, 0) >= 100 THEN 2
        ELSE 1
    END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_level(int) TO anon, authenticated, service_role;
