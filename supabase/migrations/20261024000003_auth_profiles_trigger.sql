-- ====================================================================
-- NETPULSE MIGRATION 003: Automatic Profile Creation Trigger on Sign-Up
-- Course: Probability and Statistics for Computer Science (25CS203)
-- ====================================================================

-- Trigger function executed whenever a new user is inserted into auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    initial_username TEXT;
BEGIN
    -- Extract username from raw_user_meta_data or fallback to email localpart
    initial_username := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
        NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
        'student_' || SUBSTRING(NEW.id::text FROM 1 FOR 8)
    );

    -- Insert new student profile idempotently
    INSERT INTO public.profiles (id, username, avatar_url, level, total_xp)
    VALUES (
        NEW.id,
        initial_username,
        'default_avatar',
        1,
        0
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent signup failure if profile trigger encounters transient error;
    -- profileService.js includes client-side getOrCreateProfile recovery fallback.
    RETURN NEW;
END;
$$;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
