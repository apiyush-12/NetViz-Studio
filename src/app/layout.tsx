import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkAuthProvider } from "@/components/auth/clerk-auth-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ConditionalShell } from "@/components/layout/conditional-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NetViz Studio — Interactive Network Protocol Visualization",
  description:
    "Interactive learning platform for computer networking protocols, CIDR subnetting, topology design, and hands-on networking labs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkAuthProvider>
      <html lang="en" suppressHydrationWarning className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/*
             * ConditionalShell decides per route:
             *  - "/" (landing)    → no sidebar, no auth check, full-width
             *  - all other routes → sidebar + AuthGuard (redirects if not signed in)
             */}
            <ConditionalShell>{children}</ConditionalShell>
          </ThemeProvider>
        </body>
      </html>
    </ClerkAuthProvider>
  );
}
