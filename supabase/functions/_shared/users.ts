import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Paginates through auth.admin.listUsers() — never trust page 1 alone.
export async function findUserIdByEmail(admin: SupabaseClient, email: string): Promise<string | null> {
  const perPage = 1000;
  const target = email.toLowerCase();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < perPage) return null;
  }
  return null;
}

export interface EnsureUserResult {
  userId: string;
  isNewUser: boolean;
  // One-time Supabase action_link (invite) for a brand-new user — never a password.
  actionLink?: string;
}

// Finds the identity for `email`, or creates one via admin.generateLink
// (invite) — no password is ever set or transmitted.
export async function ensureUser(
  admin: SupabaseClient,
  email: string,
  name: string,
  redirectTo: string,
): Promise<EnsureUserResult> {
  const existingUserId = await findUserIdByEmail(admin, email);
  if (existingUserId) {
    return { userId: existingUserId, isNewUser: false };
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: { name }, redirectTo },
  });

  if (error || !data?.user) {
    throw new Error(`failed to create user: ${error?.message ?? "unknown error"}`);
  }

  const userId = data.user.id;

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: userId, email, name }, { onConflict: "id" });
  if (profileError) {
    console.error("_shared/users: profile upsert failed", profileError.message);
  }

  return { userId, isNewUser: true, actionLink: data.properties?.action_link };
}
