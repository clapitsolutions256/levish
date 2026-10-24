import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Reset password",
  description: "Choose a new Empulse password.",
  path: "/reset-password",
});

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16 bg-warm-radial">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="section-heading">New password</h1>
          <p className="type-copy mt-2 text-[var(--muted)]">Choose a password for your Empulse account.</p>
        </div>
        <div className="card-warm p-8">
          <ResetPasswordForm />
        </div>
        <p className="mt-8 text-center">
          <Link href="/login" className="text-sm text-[var(--accent)] font-medium">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
