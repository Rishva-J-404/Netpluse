-- ====================================================================
-- NETPULSE MIGRATION 004: Progression, Idempotency & Leaderboard
-- Course: Probability and Statistics for Computer Science (25CS203)
-- ====================================================================

-- 1. Add idempotency_key column to game_results if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'game_results' 
          AND column_name = 'idempotency_key'
    ) THEN
        ALTER TABLE public.game_results ADD COLUMN idempotency_key TEXT;
    END IF;
END $$;

-- 2. Partial unique index to guarantee idempotent game completion submissions per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_results_idempotency 
    ON public.game_results(user_id, idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

-- 3. Pure function to compute progression level from total_xp
-- Tier definitions for 25CS203:
-- Level 1: Analyst Intern (0-99 XP)
-- Level 2: Junior NOC Operator (100-249 XP)
-- Level 3: Telemetry Specialist (250-449 XP)
-- Level 4: Senior Systems Analyst (450-699 XP)
-- Level 5: Chief Infrastructure Architect (700+ XP)
CREATE OR REPLACE FUNCTION public.calculate_level(xp int)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE
        WHEN xp >= 700 THEN 5
        WHEN xp >= 450 THEN 4
        WHEN xp >= 250 THEN 3
        WHEN xp >= 100 THEN 2
        ELSE 1
    END;
$$;

-- 4. Secure Leaderboard Function (SECURITY DEFINER with safe search_path)
-- Returns public standings without exposing private emails, account IDs, or analysis history
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
    LIMIT LEAST(GREATEST(limit_count, 1), 100);
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(int) TO anon, authenticated;

-- 5. Atomic Progression Awarding Function (Ensures concurrency safety & transactional consistency)
CREATE OR REPLACE FUNCTION public.award_user_progression(p_user_id uuid, p_xp_to_add int)
RETURNS TABLE (
    new_total_xp integer,
    new_level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_xp integer;
    updated_lvl integer;
BEGIN
    UPDATE public.profiles
    SET total_xp = GREATEST(0, total_xp + GREATEST(0, p_xp_to_add)),
        level = public.calculate_level(GREATEST(0, total_xp + GREATEST(0, p_xp_to_add))),
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING total_xp, level INTO updated_xp, updated_lvl;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile for user % not found', p_user_id;
    END IF;

    RETURN QUERY SELECT updated_xp, updated_lvl;
END;
$$;
