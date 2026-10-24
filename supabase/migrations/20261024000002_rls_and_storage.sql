-- ====================================================================
-- NETPULSE MIGRATION 002: Row-Level Security & Storage Bucket Configuration
-- Course: Probability and Statistics for Computer Science (25CS203)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Enable Row-Level Security (RLS) on all exposed tables
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 2. Profiles Table Policies (auth.uid() = id)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- --------------------------------------------------------------------
-- 3. Game Results Policies (auth.uid() = user_id)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "game_results_select_own" ON public.game_results;
CREATE POLICY "game_results_select_own"
    ON public.game_results FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_results_insert_own" ON public.game_results;
CREATE POLICY "game_results_insert_own"
    ON public.game_results FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_results_update_own" ON public.game_results;
CREATE POLICY "game_results_update_own"
    ON public.game_results FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_results_delete_own" ON public.game_results;
CREATE POLICY "game_results_delete_own"
    ON public.game_results FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 4. Achievements Catalog Policies (Public Read, Admin Write Only)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "achievements_select_all" ON public.achievements;
CREATE POLICY "achievements_select_all"
    ON public.achievements FOR SELECT
    TO public
    USING (true);

-- (No INSERT/UPDATE/DELETE policies for authenticated or anon roles; modifications restricted to service_role)

-- --------------------------------------------------------------------
-- 5. User Achievements Join Table Policies (auth.uid() = user_id)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "user_achievements_select_own" ON public.user_achievements;
CREATE POLICY "user_achievements_select_own"
    ON public.user_achievements FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_insert_own" ON public.user_achievements;
CREATE POLICY "user_achievements_insert_own"
    ON public.user_achievements FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_delete_own" ON public.user_achievements;
CREATE POLICY "user_achievements_delete_own"
    ON public.user_achievements FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 6. Analysis History Policies (auth.uid() = user_id)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "analysis_history_select_own" ON public.analysis_history;
CREATE POLICY "analysis_history_select_own"
    ON public.analysis_history FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "analysis_history_insert_own" ON public.analysis_history;
CREATE POLICY "analysis_history_insert_own"
    ON public.analysis_history FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "analysis_history_update_own" ON public.analysis_history;
CREATE POLICY "analysis_history_update_own"
    ON public.analysis_history FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "analysis_history_delete_own" ON public.analysis_history;
CREATE POLICY "analysis_history_delete_own"
    ON public.analysis_history FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 7. Datasets Metadata Policies (auth.uid() = user_id)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "datasets_select_own" ON public.datasets;
CREATE POLICY "datasets_select_own"
    ON public.datasets FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "datasets_insert_own" ON public.datasets;
CREATE POLICY "datasets_insert_own"
    ON public.datasets FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "datasets_update_own" ON public.datasets;
CREATE POLICY "datasets_update_own"
    ON public.datasets FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "datasets_delete_own" ON public.datasets;
CREATE POLICY "datasets_delete_own"
    ON public.datasets FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 8. Supabase Storage Configuration (network-datasets bucket)
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
CREATE POLICY "storage_datasets_select_own"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'network-datasets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "storage_datasets_insert_own" ON storage.objects;
CREATE POLICY "storage_datasets_insert_own"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'network-datasets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "storage_datasets_update_own" ON storage.objects;
CREATE POLICY "storage_datasets_update_own"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'network-datasets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'network-datasets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "storage_datasets_delete_own" ON storage.objects;
CREATE POLICY "storage_datasets_delete_own"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'network-datasets'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
