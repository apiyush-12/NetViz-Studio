"use client";

import { AppHeader } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle, Label, Switch, Button, Badge } from "@/components/ui";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEFAULT_PREFERENCES, STORAGE_KEYS, SIMULATION_SPEEDS } from "@/lib/constants";
import { useSafeUser, SafeUserButton, SafeSignInButton, SafeSignOutButton } from "@/components/auth/safe-auth";
import { User, ShieldCheck, SunMoon, Sliders, LogIn, LogOut, CheckCircle2, UserCheck, KeyRound, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [prefs, setPrefs, loaded] = useLocalStorage(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES);
  const { isLoaded, isSignedIn, user, isConfigured } = useSafeUser();

  if (!loaded) {
    return (
      <>
        <AppHeader title="Settings" />
        <div className="p-6 text-muted-foreground">Loading preferences...</div>
      </>
    );
  }

  const primaryEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;

  return (
    <>
      <AppHeader title="Settings" description="User account, authentication, theme mode, and visualizer preferences" />

      <div className="p-4 md:p-6 max-w-3xl space-y-6 mx-auto">
        {/* User Account & Profile Section */}
        <Card className="border-border bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> User Account & Authentication
              </span>
              {isSignedIn ? (
                <Badge variant="success" className="text-xs gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Clerk Authenticated
                </Badge>
              ) : isConfigured ? (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Guest Mode
                </Badge>
              ) : (
                <Badge variant="warning" className="text-xs gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Clerk Unconfigured
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLoaded ? (
              <div className="text-xs text-muted-foreground">Loading user profile...</div>
            ) : isSignedIn && user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30">
                  <div className="relative shrink-0">
                    <SafeUserButton appearance={{ elements: { avatarBox: "h-14 w-14 rounded-full border-2 border-primary" } }} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-foreground truncate">
                        {user.fullName || user.username || "Authenticated User"}
                      </h4>
                      <Badge variant="success" className="text-[10px]">Active Session</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{primaryEmail || "No email on record"}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">User ID: {user.id}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> Account Status
                    </span>
                    <p className="font-semibold text-foreground">Verified Individual Profile</p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <KeyRound className="h-3.5 w-3.5 text-primary" /> Auth Provider
                    </span>
                    <p className="font-semibold text-foreground">Clerk SSO / Identity Engine</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Your lab progress and topology data are isolated to your unique user ID.
                  </p>
                  <SafeSignOutButton>
                    <Button size="sm" variant="destructive" className="h-8 text-xs gap-1.5 font-semibold">
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </Button>
                  </SafeSignOutButton>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4 rounded-xl border border-dashed border-border bg-secondary/20 text-center">
                <div className="max-w-md mx-auto space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm">Sign in to track progress individually</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isConfigured
                      ? "Create an account or sign in with Clerk to save your completed labs, custom topologies, quiz scores, and personalized learning history across devices."
                      : "Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env.local file to activate Clerk Authentication for individual progress tracking."}
                  </p>
                </div>

                <SafeSignInButton mode="modal">
                  <Button size="sm" variant="default" className="gap-2 text-xs font-semibold px-6">
                    <LogIn className="h-4 w-4" /> Sign In / Register with Clerk
                  </Button>
                </SafeSignInButton>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Day & Light Mode Theme Toggle Section */}
        <Card className="border-border bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <SunMoon className="h-5 w-5 text-amber-400" /> Appearance & Theme Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/30">
              <div className="space-y-1">
                <Label className="font-semibold text-sm text-foreground">Color Scheme</Label>
                <p className="text-xs text-muted-foreground">
                  Switch between Light (Day), Dark (Night), or follow your system preference.
                </p>
              </div>

              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Simulation Preferences Section */}
        <Card className="border-border bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-5 w-5 text-purple-400" /> Simulation & Visualizer Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="mb-2 block text-xs font-semibold">Default Forwarding Animation Speed</Label>
              <div className="flex gap-2 flex-wrap">
                {SIMULATION_SPEEDS.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={prefs.defaultSpeed === s ? "default" : "outline"}
                    onClick={() => setPrefs({ ...prefs, defaultSpeed: s })}
                    className="h-8 text-xs font-mono"
                  >
                    {s}x
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <Label className="mb-2 block text-xs font-semibold">Explanation Detail Mode</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={prefs.explanationMode === "beginner" ? "default" : "outline"}
                  onClick={() => setPrefs({ ...prefs, explanationMode: "beginner" })}
                  className="h-8 text-xs gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Beginner Explanations
                </Button>
                <Button
                  size="sm"
                  variant={prefs.explanationMode === "advanced" ? "default" : "outline"}
                  onClick={() => setPrefs({ ...prefs, explanationMode: "advanced" })}
                  className="h-8 text-xs gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Advanced Protocol Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Section */}
        <Card className="border-border bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Accessibility & Animations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduced-motion" className="text-sm font-semibold">Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">
                  Suppresses non-essential canvas transitions and packet animations.
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={prefs.reducedMotion}
                onCheckedChange={(v) => setPrefs({ ...prefs, reducedMotion: v })}
                aria-label="Reduce motion"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
