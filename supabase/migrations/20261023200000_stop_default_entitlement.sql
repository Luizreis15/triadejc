-- Perfil novo deixa de receber Jornada Única sozinho.
-- Entitlement passa a vir só da compra (webhook) ou de um grant do admin.
-- Linhas já existentes em entitlements permanecem.

DROP TRIGGER IF EXISTS on_profile_created_grant_entitlement ON public.profiles;

DROP FUNCTION IF EXISTS public.grant_default_entitlement();
