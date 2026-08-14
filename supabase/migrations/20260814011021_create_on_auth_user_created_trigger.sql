-- The handle_new_user() function existed but was never wired to auth.users
-- (it was set up manually as a dashboard trigger on the old project, so it
-- never made it into a migration). Without this, direct signups via
-- supabase.auth.signUp()/signInWithOtp() never get a row in public.profiles.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
