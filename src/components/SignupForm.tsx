"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCustomerSession } from "@/lib/customerSession";
import { PasswordField } from "@/components/PasswordField";
import { accountApi } from "@/store/accountApi";
import { useSignupMutation } from "@/store/authApi";
import { apiError } from "@/store/apiError";
import { store } from "@/store/store";
import { identifyMetaUser, trackCompleteRegistration } from "@/lib/metaPixel";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [signup] = useSignupMutation();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const data = await signup({ name, email, password }).unwrap();
      if (data.token && data.user) {
        saveCustomerSession({ ...data.user, token: data.token });
        const [firstName, ...rest] = data.user.name.split(" ");
        identifyMetaUser({
          email: data.user.email,
          firstName,
          lastName: rest.join(" "),
          externalId: data.user.id,
        });
        trackCompleteRegistration(data.user.email);
        store.dispatch(accountApi.util.resetApiState());
        router.push("/");
        router.refresh();
        return;
      }
      router.push("/login");
    } catch (err) {
      setError(apiError(err, "Could not create the account."));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="input-warm"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
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
        <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Password
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
        <p className="mt-1.5 text-xs text-[var(--muted)]">Must be at least 8 characters.</p>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn-primary w-full justify-center" disabled={pending}>
        {pending ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
