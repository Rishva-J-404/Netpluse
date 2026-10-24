-- ====================================================================
-- NETPULSE SUPABASE RLS & CONSTRAINTS TEST SUITE
-- Course: Probability and Statistics for Computer Science (25CS203)
-- 
-- Reproducible SQL test suite executable in Supabase SQL Editor or psql.
-- Tests constraints, repeatable seed data, and Row-Level Security isolation.
-- Wrapped in a transaction with ROLLBACK to prevent test pollution.
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- Test 1: Verify Schema Tables Existence & RLS Enabled
-- --------------------------------------------------------------------
DO $$
DECLARE
    tbl text;
    rls_enabled boolean;
    required_tables text[] := ARRAY[
        'profiles',
        'game_results',
        'achievements',
        'user_achievements',
        'analysis_history',
        'datasets'
    ];
BEGIN
    FOREACH tbl IN ARRAY required_tables LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class
        WHERE relname = tbl AND relnamespace = 'public'::regnamespace;

        IF rls_enabled IS NULL THEN
            RAISE EXCEPTION 'Table public.% does not exist!', tbl;
        ELSIF rls_enabled = false THEN
            RAISE EXCEPTION 'Table public.% does not have RLS enabled!', tbl;
        ELSE
            RAISE NOTICE 'SUCCESS: Table public.% verified with RLS enabled.', tbl;
        END IF;
    END LOOP;
END $$;

-- --------------------------------------------------------------------
-- Test 2: Verify Repeatable Seed Insertion
-- --------------------------------------------------------------------
DO $$
DECLARE
    ach_count integer;
BEGIN
    SELECT count(*) INTO ach_count FROM public.achievements;
    IF ach_count < 7 THEN
        RAISE EXCEPTION 'Achievement catalog count expected >= 7, got %', ach_count;
    ELSE
        RAISE NOTICE 'SUCCESS: Achievement catalog populated with % records.', ach_count;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- Test 3: Unauthenticated / Anon Access to Private Tables must return 0 rows
-- --------------------------------------------------------------------
SET LOCAL ROLE anon;
DO $$
DECLARE
    row_count integer;
BEGIN
    SELECT count(*) INTO row_count FROM public.profiles;
    IF row_count > 0 THEN
        RAISE EXCEPTION 'RLS FAILURE: Anon role read % profiles!', row_count;
    ELSE
        RAISE NOTICE 'SUCCESS: Anon role blocked from reading profiles.';
    END IF;

    SELECT count(*) INTO row_count FROM public.analysis_history;
    IF row_count > 0 THEN
        RAISE EXCEPTION 'RLS FAILURE: Anon role read % analysis_history rows!', row_count;
    ELSE
        RAISE NOTICE 'SUCCESS: Anon role blocked from reading analysis_history.';
    END IF;

    -- Public achievements catalog SHOULD be readable by anon
    SELECT count(*) INTO row_count FROM public.achievements;
    IF row_count = 0 THEN
        RAISE EXCEPTION 'RLS FAILURE: Anon role could not read public achievements catalog!';
    ELSE
        RAISE NOTICE 'SUCCESS: Anon role successfully read public achievement catalog (% rows).', row_count;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- Test 4: Authenticated User Isolation Simulation (User A vs User B)
-- --------------------------------------------------------------------
-- Reset to postgres admin to setup test fixtures
RESET ROLE;

DO $$
DECLARE
    user_a_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
    user_b_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
    history_a_id uuid;
    history_b_id uuid;
    found_rows integer;
BEGIN
    -- Create dummy profiles for test users
    INSERT INTO public.profiles (id, username, total_xp)
    VALUES (user_a_id, 'test_student_a', 100),
           (user_b_id, 'test_student_b', 200)
    ON CONFLICT (id) DO NOTHING;

    -- Create private analysis record for User A
    INSERT INTO public.analysis_history (
        user_id, dataset_name, mean, variance, std_deviation,
        current_load, z_score, probability, status, health_score
    ) VALUES (
        user_a_id, 'campus_network', 39.77, 195.24, 13.97,
        62.0, 1.59, 0.9442, 'NORMAL', 85
    ) RETURNING id INTO history_a_id;

    -- Create private analysis record for User B
    INSERT INTO public.analysis_history (
        user_id, dataset_name, mean, variance, std_deviation,
        current_load, z_score, probability, status, health_score
    ) VALUES (
        user_b_id, 'campus_network', 39.77, 195.24, 13.97,
        85.0, 3.24, 0.9994, 'UNUSUALLY HIGH', 44
    ) RETURNING id INTO history_b_id;

    RAISE NOTICE 'SUCCESS: Test fixtures created for User A (%) and User B (%).', user_a_id, user_b_id;
END $$;

-- Test User A Isolation:
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

DO $$
DECLARE
    user_a_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
    user_b_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
    seen_rows integer;
BEGIN
    -- User A can see their own analysis history
    SELECT count(*) INTO seen_rows FROM public.analysis_history WHERE user_id = user_a_id;
    IF seen_rows = 0 THEN
        RAISE EXCEPTION 'RLS FAILURE: User A could not see their own analysis history!';
    ELSE
        RAISE NOTICE 'SUCCESS: User A successfully read own analysis history (% rows).', seen_rows;
    END IF;

    -- User A CANNOT see User B's analysis history
    SELECT count(*) INTO seen_rows FROM public.analysis_history WHERE user_id = user_b_id;
    IF seen_rows > 0 THEN
        RAISE EXCEPTION 'RLS VIOLATION: User A was able to read % of User B analysis records!', seen_rows;
    ELSE
        RAISE NOTICE 'SUCCESS: User A blocked from reading User B analysis history.';
    END IF;

    -- User A CANNOT see User B's profile
    SELECT count(*) INTO seen_rows FROM public.profiles WHERE id = user_b_id;
    IF seen_rows > 0 THEN
        RAISE EXCEPTION 'RLS VIOLATION: User A was able to read User B profile!';
    ELSE
        RAISE NOTICE 'SUCCESS: User A blocked from reading User B profile.';
    END IF;
END $$;

-- --------------------------------------------------------------------
-- Test 5: Storage Bucket Configuration Verification
-- --------------------------------------------------------------------
RESET ROLE;
DO $$
DECLARE
    bucket_exists boolean;
    is_pub boolean;
BEGIN
    SELECT exists(SELECT 1 FROM storage.buckets WHERE id = 'network-datasets'), public
    INTO bucket_exists, is_pub
    FROM storage.buckets WHERE id = 'network-datasets';

    IF NOT bucket_exists THEN
        RAISE NOTICE 'INFO: storage.buckets table or network-datasets bucket not present in current environment (expected if running against standard PostgreSQL without Supabase storage extension).';
    ELSIF is_pub THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: network-datasets bucket must be PRIVATE, but public=true!';
    ELSE
        RAISE NOTICE 'SUCCESS: network-datasets bucket exists and is properly configured as PRIVATE.';
    END IF;
END $$;

ROLLBACK;
-- Clean rollback ensuring no test artifacts remain.
