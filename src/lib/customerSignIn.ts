import { getSupabase, SHARED_DATABASE } from "@/lib/supabase";
import { hashPassword, hashResetToken, newResetToken, signCustomerToken, verifyCustomerToken, verifyPassword } from "@/lib/customerAccounts";
import { sendPasswordReset } from "@/lib/email";

// How customers sign in depends on where Levish's data lives:
// - In the project shared with Empulse, Supabase Auth users would be shared between the two stores,
//   so Levish keeps its own accounts (password hashes in its profiles table, its own tokens).
// - In Levish's own project, Supabase Auth belongs to Levish alone and is used as before.
const OWN_ACCOUNTS = SHARED_DATABASE;

export type SignedInCustomer = { id: string; email: string; name: string };
type Result = { token: string; user: SignedInCustomer } | { error: string; status: number };

export async function customerFromToken(token: string): Promise<SignedInCustomer | null> {
  if (OWN_ACCOUNTS) return verifyCustomerToken(token);
  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user?.email) return null;
  return { id: data.user.id, email: data.user.email, name: String(data.user.user_metadata?.name ?? "") };
}

export async function signUp(name: string, email: string, password: string): Promise<Result> {
  const supabase = getSupabase();
  const taken = { error: "An account with this email already exists.", status: 409 };
  if (OWN_ACCOUNTS) {
    const { data: existing } = await supabase.from("profiles").select("id, password_hash").eq("email", email).maybeSingle();
    if (existing?.password_hash) return taken;
    const passwordHash = await hashPassword(password);
    // A profile moved over without a password is claimed by signing up again.
    const saved = existing
      ? await supabase.from("profiles").update({ name, password_hash: passwordHash }).eq("id", existing.id).select("id").single()
      : await supabase.from("profiles").insert({ name, email, password_hash: passwordHash }).select("id").single();
    if (saved.error || !saved.data) {
      if (saved.error?.code === "23505") return taken;
      throw saved.error;
    }
    const user = { id: saved.data.id as string, email, name };
    return { token: signCustomerToken(user), user };
  }
  const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
  if (created.error) {
    const message = created.error.message.toLowerCase();
    if (message.includes("already") || message.includes("registered") || message.includes("exists")) return taken;
    return { error: "Could not create the account.", status: 400 };
  }
  return signIn(email, password);
}

export async function signIn(email: string, password: string): Promise<Result> {
  const wrong = { error: "Email or password is incorrect.", status: 401 };
  const supabase = getSupabase();
  if (OWN_ACCOUNTS) {
    const { data } = await supabase.from("profiles").select("id, name, email, password_hash").eq("email", email).maybeSingle();
    if (!data?.password_hash || !(await verifyPassword(password, data.password_hash))) return wrong;
    const user = { id: data.id as string, email: data.email as string, name: String(data.name ?? "") };
    return { token: signCustomerToken(user), user };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) return wrong;
  return {
    token: data.session.access_token,
    user: { id: data.user.id, email: data.user.email ?? email, name: String(data.user.user_metadata?.name ?? "") },
  };
}

/** Sends a reset link if the account exists; says nothing either way. */
export async function requestPasswordReset(email: string, origin: string) {
  const supabase = getSupabase();
  if (OWN_ACCOUNTS) {
    const { data: profile } = await supabase.from("profiles").select("id, name").eq("email", email).maybeSingle();
    if (!profile) return;
    const reset = newResetToken();
    await supabase.from("profiles").update({ reset_token_hash: reset.hash, reset_expires_at: reset.expiresAt }).eq("id", profile.id);
    await sendPasswordReset(email, String(profile.name ?? ""), `${origin}/reset-password?token=${reset.token}`);
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` });
  if (error) console.error("Forgot password error:", error.message);
}

export async function resetPassword(token: string, password: string): Promise<Result> {
  const invalid = { error: "This reset link is invalid or expired.", status: 400 };
  const supabase = getSupabase();
  if (OWN_ACCOUNTS) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email, reset_expires_at")
      .eq("reset_token_hash", hashResetToken(token))
      .maybeSingle();
    if (!profile?.reset_expires_at || new Date(profile.reset_expires_at).getTime() < Date.now()) return invalid;
    const updated = await supabase
      .from("profiles")
      .update({ password_hash: await hashPassword(password), reset_token_hash: null, reset_expires_at: null })
      .eq("id", profile.id);
    if (updated.error) return { error: "Could not update the password.", status: 400 };
    const user = { id: profile.id as string, email: profile.email as string, name: String(profile.name ?? "") };
    return { token: signCustomerToken(user), user };
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return invalid;
  const updated = await supabase.auth.admin.updateUserById(data.user.id, { password });
  if (updated.error) return { error: "Could not update the password.", status: 400 };
  return signIn(data.user.email, password);
}

export async function changePassword(customer: SignedInCustomer, currentPassword: string, newPassword: string) {
  const supabase = getSupabase();
  if (OWN_ACCOUNTS) {
    const { data } = await supabase.from("profiles").select("password_hash").eq("id", customer.id).maybeSingle();
    if (!data?.password_hash || !(await verifyPassword(currentPassword, data.password_hash))) return { error: "Current password is incorrect.", status: 401 };
    const updated = await supabase.from("profiles").update({ password_hash: await hashPassword(newPassword) }).eq("id", customer.id);
    return updated.error ? { error: "Could not update the password.", status: 400 } : null;
  }
  const check = await supabase.auth.signInWithPassword({ email: customer.email, password: currentPassword });
  if (check.error) return { error: "Current password is incorrect.", status: 401 };
  const updated = await supabase.auth.admin.updateUserById(customer.id, { password: newPassword });
  return updated.error ? { error: "Could not update the password.", status: 400 } : null;
}

/** Keeps the sign-in record's name in step with the profile. */
export async function renameCustomer(id: string, name: string) {
  if (OWN_ACCOUNTS) return;
  const updated = await getSupabase().auth.admin.updateUserById(id, { user_metadata: { name } });
  if (updated.error) throw updated.error;
}
