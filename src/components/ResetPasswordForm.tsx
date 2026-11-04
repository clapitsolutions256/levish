"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/PasswordField";
import { saveCustomerSession } from "@/lib/customerSession";
import { useResetPasswordMutation } from "@/store/authApi";
import { apiError } from "@/store/apiError";

export function ResetPasswordForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  useEffect(() => {
    // Levish's own reset email links to /reset-password?token=...; Supabase's puts access_token in the hash.
    const linkToken = new URLSearchParams(window.location.search).get("token") ?? "";
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const supabaseToken = ["recovery", null].includes(hash.get("type")) ? hash.get("access_token") ?? "" : "";
    if (linkToken || supabaseToken) setToken(linkToken || supabaseToken);
    setReady(true);
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const data = await resetPassword({ token, password }).unwrap();
      if (data.token && data.user) {
        saveCustomerSession({ ...data.user, token: data.token });
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(apiError(err, "Could not update the password."));
    } finally {
      setPending(false);
    }
  }

  if (!ready) return null;

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-[var(--muted)]">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-[var(--accent)]">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          New password
        </label>
        <PasswordField
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          value={password}
          onChange={setPassword}
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn-primary w-full justify-center" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
