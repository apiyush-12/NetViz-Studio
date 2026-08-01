"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

export const isClerkConfigured =
  typeof process !== "undefined" &&
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes("your_clerk_publishable_key") &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes("netviz.local") &&
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_") ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_"));

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (isClerkConfigured && publishableKey) {
    return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
  }

  return <>{children}</>;
}
