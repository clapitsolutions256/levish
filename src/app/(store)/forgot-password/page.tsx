import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Forgot password",
  description: "Reset your Empulse account password.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16 bg-warm-radial">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-14 h-14 rounded-full bg-[var(--cream)] flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="section-heading">
            Reset Password
          </h1>
          <p className="type-copy mt-2 text-[var(--muted)]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="card-warm p-8 animate-fade-up animation-delay-100">
          <ForgotPasswordForm />
        </div>

        <p className="mt-8 text-center animate-fade-up animation-delay-200">
          <Link href="/login" className="text-sm text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
