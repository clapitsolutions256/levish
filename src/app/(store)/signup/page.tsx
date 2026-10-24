import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/SignupForm";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Sign up",
  description: "Create your Empulse account for faster checkout and order tracking.",
  path: "/signup",
});

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16 bg-warm-radial">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <p className="eyebrow mb-3">Join the Family</p>
          <h1 className="section-heading">
            Create Account
          </h1>
          <p className="type-copy mt-2 text-[var(--muted)]">
            Faster checkout, order tracking and early access to drops.
          </p>
        </div>

        <div className="card-warm p-8 animate-fade-up animation-delay-100">
          <SignupForm />
        </div>

        <p className="type-copy mt-8 text-center text-[var(--muted)] animate-fade-up animation-delay-200">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
