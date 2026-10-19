-- 031: clients can no longer write profiles (including profiles.role).
-- NOT APPLIED. Needs Kati's approval before it runs on production.
--
-- anon and authenticated had INSERT/UPDATE on profiles.role. Those column
-- privileges came from the Supabase default *table-level* INSERT/UPDATE grants,
-- and in Postgres a column-level REVOKE does not remove a table-level grant. So
-- we revoke the table-level write privileges. Nothing in the app writes
-- profiles with the anon or user client: rows are created by the
-- SECURITY DEFINER handle_new_user() trigger, and roles are changed by
-- service_role only. SELECT stays (RLS limits it to the user's own row; the
-- admin role check in middleware.ts and lib/admin-auth.ts needs it).

BEGIN;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.profiles FROM anon, authenticated;
-- Belt and braces in case a column-level grant was ever made directly.
REVOKE INSERT (role), UPDATE (role) ON public.profiles FROM anon, authenticated;

COMMIT;
