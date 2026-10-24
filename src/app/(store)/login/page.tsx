import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { privateMeta } from "@/lib/site";

export const metadata: Metadata = privateMeta({
  title: "Login",
  description: "Sign in to your Empulse account.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16 bg-warm-radial">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <p className="eyebrow mb-3">Welcome Back</p>
          <h1 className="section-heading">
            Sign In
          </h1>
          <p className="type-copy mt-2 text-[var(--muted)]">
            Track orders and save your favourites.
          </p>
        </div>

        <div className="card-warm p-8 animate-fade-up animation-delay-100">
          <LoginForm />
        </div>

        <p className="type-copy mt-8 text-center text-[var(--muted)] animate-fade-up animation-delay-200">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
