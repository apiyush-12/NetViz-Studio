"use client";

import React from "react";
import { useUser, UserButton, SignInButton, SignOutButton } from "@clerk/nextjs";
import { isClerkConfigured } from "./clerk-auth-provider";
import { Button } from "@/components/ui";
import { User, KeyRound } from "lucide-react";

export function useSafeUser() {
  if (!isClerkConfigured) {
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
      isConfigured: false,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerkData = useUser();
  return {
    ...clerkData,
    isConfigured: true,
  };
}

export function SafeUserButton(props: React.ComponentProps<typeof UserButton>) {
  if (!isClerkConfigured) {
    return (
      <div className="h-8 w-8 rounded-full border border-border bg-secondary flex items-center justify-center text-muted-foreground text-xs font-bold">
        <User className="h-4 w-4" />
      </div>
    );
  }

  return <UserButton {...props} />;
}

export function SafeSignInButton({ children, mode = "modal" }: { children?: React.ReactNode; mode?: "modal" | "redirect" }) {
  if (!isClerkConfigured) {
    return (
      <Button
        size="sm"
        variant="default"
        className="h-8 text-xs gap-1.5 font-semibold"
        onClick={() => {
          alert(
            "To enable live Clerk Authentication, add your NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to .env.local file.\n\nExample:\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...\nCLERK_SECRET_KEY=sk_test_..."
          );
        }}
      >
        <KeyRound className="h-3.5 w-3.5" /> Setup Clerk Auth
      </Button>
    );
  }

  return <SignInButton mode={mode}>{children}</SignInButton>;
}

export function SafeSignOutButton({ children }: { children?: React.ReactNode }) {
  if (!isClerkConfigured) {
    return null;
  }

  return <SignOutButton>{children}</SignOutButton>;
}
