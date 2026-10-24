"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveCustomerSession } from "@/lib/customerSession";
import { PasswordField } from "@/components/PasswordField";
import { accountApi } from "@/store/accountApi";
import { useLoginMutation } from "@/store/authApi";
import { apiError } from "@/store/apiError";
import { store } from "@/store/store";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [login] = useLoginMutation();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const data = await login({ email, password }).unwrap();
      if (!data.token || !data.user) {
        setError("Could not sign in.");
        return;
      }
      saveCustomerSession({ ...data.user, token: data.token });
      store.dispatch(accountApi.util.resetApiState());
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(apiError(err, "Could not sign in."));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input-warm"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
            Forgot password?
          </Link>
        </div>
        <PasswordField
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn-primary w-full justify-center" disabled={pending}>
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
