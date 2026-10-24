-- ====================================================================
-- NETPULSE MIGRATION 001: Initial Database Schema
-- Course: Probability and Statistics for Computer Science (25CS203)
-- ====================================================================

-- Function for automatic updated_at timestamp maintenance
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Profiles Table (Linked to Supabase Auth User ID)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT DEFAULT 'default_avatar',
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for profile updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 2. Game Results Table
CREATE TABLE IF NOT EXISTS public.game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    scenario_id TEXT,
    score INTEGER DEFAULT 0 CHECK (score >= 0),
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    accuracy NUMERIC(5, 2) DEFAULT 0.00 CHECK (accuracy >= 0.00 AND accuracy <= 100.00),
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Achievements Master Catalog
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 50 CHECK (xp_reward >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. User Achievements Join Table (Track Unlocked Badges)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- 5. Analysis History Table (Audit Trail of Statistical Calculations)
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

-- 6. Datasets Metadata Table
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    description TEXT,
    record_count INTEGER CHECK (record_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance & Ownership Indexes
CREATE INDEX IF NOT EXISTS idx_game_results_user ON public.game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_user ON public.analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_user ON public.datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(total_xp DESC);
