-- ====================================================================
-- NETPULSE SUPABASE POSTGRESQL MASTER SCHEMA
-- Course: Probability and Statistics for Computer Science (25CS203)
-- Combines Migration 001 (Schema) and Migration 002 (RLS & Storage)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Automatic Timestamp Handler
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 2. Profiles Table (Linked to Supabase Auth User ID)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT DEFAULT 'default_avatar',
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Automatic profile creation on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_username TEXT;
BEGIN
    initial_username := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
        NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
        'student_' || SUBSTRING(NEW.id::text, 1, 8)
    );

    INSERT INTO public.profiles (id, username, avatar_url, level, total_xp)
    VALUES (NEW.id, initial_username, 'default_avatar', 1, 0)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 3. Game Results Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    scenario_id TEXT,
    score INTEGER DEFAULT 0 CHECK (score >= 0),
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    accuracy NUMERIC(5, 2) DEFAULT 0.00 CHECK (accuracy >= 0.00 AND accuracy <= 100.00),
    idempotency_key TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 4. Achievements Master Catalog
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 50 CHECK (xp_reward >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 5. User Achievements Join Table (Track Unlocked Badges)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- --------------------------------------------------------------------
-- 6. Analysis History Table (Audit Trail of Statistical Calculations)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dataset_name TEXT DEFAULT 'campus_network',
    mean NUMERIC(10, 4) NOT NULL,
    variance NUMERIC(10, 4) NOT NULL,
    std_deviation NUMERIC(10, 4) NOT NULL,
    current_load NUMERIC(10, 4) NOT NULL,
    z_score NUMERIC(10, 4) NOT NULL,
    probability NUMERIC(8, 6) NOT NULL CHECK (probability >= 0.0 AND probability <= 1.0),
    status TEXT NOT NULL,
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 7. Datasets Metadata Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    description TEXT,
    record_count INTEGER CHECK (record_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 8. Performance Indexes
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_game_results_user ON public.game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_user ON public.analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_user ON public.datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(total_xp DESC);

-- --------------------------------------------------------------------
-- 9. Row-Level Security (RLS) Activation
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 10. Table RLS Policies
-- --------------------------------------------------------------------

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Game Results Policies
DROP POLICY IF EXISTS "game_results_select_own" ON public.game_results;
CREATE POLICY "game_results_select_own" ON public.game_results FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_results_insert_own" ON public.game_results;
CREATE POLICY "game_results_insert_own" ON public.game_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_results_update_own" ON public.game_results;
CREATE POLICY "game_results_update_own" ON public.game_results FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_results_delete_own" ON public.game_results;
CREATE POLICY "game_results_delete_own" ON public.game_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Achievements Catalog Policies (Public Read, Admin Write Only)
DROP POLICY IF EXISTS "achievements_select_all" ON public.achievements;
CREATE POLICY "achievements_select_all" ON public.achievements FOR SELECT TO public USING (true);

-- User Achievements Policies
DROP POLICY IF EXISTS "user_achievements_select_own" ON public.user_achievements;
CREATE POLICY "user_achievements_select_own" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_insert_own" ON public.user_achievements;
CREATE POLICY "user_achievements_insert_own" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_delete_own" ON public.user_achievements;
CREATE POLICY "user_achievements_delete_own" ON public.user_achievements FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Analysis History Policies
DROP POLICY IF EXISTS "analysis_history_select_own" ON public.analysis_history;
CREATE POLICY "analysis_history_select_own" ON public.analysis_history FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "analysis_history_insert_own" ON public.analysis_history;
CREATE POLICY "analysis_history_insert_own" ON public.analysis_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "analysis_history_update_own" ON public.analysis_history;
CREATE POLICY "analysis_history_update_own" ON public.analysis_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "analysis_history_delete_own" ON public.analysis_history;
CREATE POLICY "analysis_history_delete_own" ON public.analysis_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Datasets Policies
DROP POLICY IF EXISTS "datasets_select_own" ON public.datasets;
CREATE POLICY "datasets_select_own" ON public.datasets FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "datasets_insert_own" ON public.datasets;
CREATE POLICY "datasets_insert_own" ON public.datasets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "datasets_update_own" ON public.datasets;
CREATE POLICY "datasets_update_own" ON public.datasets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "datasets_delete_own" ON public.datasets;
CREATE POLICY "datasets_delete_own" ON public.datasets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 11. Supabase Storage Configuration (network-datasets bucket)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'network-datasets',
    'network-datasets',
    false,
    5242880, -- 5 MB upload limit
    ARRAY['text/csv', 'application/vnd.ms-excel', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['text/csv', 'application/vnd.ms-excel', 'text/plain'];

-- Storage RLS on storage.objects: Folder pattern is `<auth.uid()>/<filename>`
DROP POLICY IF EXISTS "storage_datasets_select_own" ON storage.objects;
CREATE POLICY "storage_datasets_select_own" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'network-datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "storage_datasets_insert_own" ON storage.objects;
CREATE POLICY "storage_datasets_insert_own" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'network-datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "storage_datasets_update_own" ON storage.objects;
CREATE POLICY "storage_datasets_update_own" ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'network-datasets' AND auth.uid()::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'network-datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "storage_datasets_delete_own" ON storage.objects;
CREATE POLICY "storage_datasets_delete_own" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'network-datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- --------------------------------------------------------------------
-- 10. Progression Helpers & Leaderboard View/Function (Phase 9)
-- --------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_results_idempotency 
    ON public.game_results(user_id, idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.calculate_level(xp int)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
    SELECT CASE
        WHEN xp >= 700 THEN 5
        WHEN xp >= 450 THEN 4
        WHEN xp >= 250 THEN 3
        WHEN xp >= 100 THEN 2
        ELSE 1
    END;
$$;

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
