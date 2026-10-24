"use client";

import { useState } from "react";
import { useForgotPasswordMutation } from "@/store/authApi";
import { apiError } from "@/store/apiError";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);
    try {
      const data = await forgotPassword({ email }).unwrap();
      setMessage(data.message);
    } catch (err) {
      setError(apiError(err, "Could not send the reset link."));
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
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--foreground)]">{message}</p> : null}
      <button type="submit" className="btn-primary w-full justify-center" disabled={pending}>
        {pending ? "Sending…" : "Send Reset Link"}
      </button>
    </form>
  );
}
