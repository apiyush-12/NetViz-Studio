"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSafeUser } from "@/components/auth/safe-auth";
import { isClerkConfigured } from "@/components/auth/clerk-auth-provider";
import { Network, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard — wraps protected app pages.
 *
 * When Clerk IS configured:
 *   Middleware handles the redirect server-side — this component is a no-op for
 *   authenticated users, and a safety net for any edge cases.
 *
 * When Clerk is NOT configured (Guest Mode):
 *   Middleware cannot enforce auth, so this client component shows a
 *   "Setup Required" screen instead of the protected page content.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useSafeUser();
  const router = useRouter();

  // When Clerk is configured & user is not signed in, redirect to landing
  // isClerkConfigured is a module-level constant — excluded from deps intentionally
  useEffect(() => {
    if (isClerkConfigured && isLoaded && !isSignedIn) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, router]);

  // Clerk configured — loading state
  if (isClerkConfigured && !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-mono">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Clerk configured — redirect happening (don't flash protected content)
  if (isClerkConfigured && !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-3 text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground font-mono">Redirecting to sign-in…</p>
        </div>
      </div>
    );
  }

  // Clerk NOT configured — Guest Mode warning screen
  if (!isClerkConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full border border-border rounded-2xl bg-card p-8 shadow-2xl space-y-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto">
            <Network className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-foreground">Authentication Required</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This page requires a signed-in account. Clerk authentication is not yet configured for this instance.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-left space-y-2 text-xs font-mono text-amber-400">
            <p className="font-bold text-amber-300 text-[11px] uppercase">Setup Required — .env.local</p>
            <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…</p>
            <p>CLERK_SECRET_KEY=sk_test_…</p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full gap-2 text-xs font-bold">
                <Sparkles className="h-4 w-4" /> Back to Landing Page
              </Button>
            </Link>
            <a
              href="https://clerk.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline font-medium"
            >
              View Clerk Setup Guide →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated — render protected content
  return <>{children}</>;
}
