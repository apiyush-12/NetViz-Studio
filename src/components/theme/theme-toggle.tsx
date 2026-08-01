"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-1.5 p-1 rounded-xl border border-border bg-card", className)}>
        <Button size="sm" variant="ghost" className="h-8 px-3 text-xs gap-1.5 opacity-50" disabled>
          <Sun className="h-3.5 w-3.5" /> Light
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-3 text-xs gap-1.5 opacity-50" disabled>
          <Moon className="h-3.5 w-3.5" /> Dark
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5 p-1 rounded-xl border border-border bg-card shadow-sm", className)}>
      <Button
        size="sm"
        variant={theme === "light" ? "default" : "ghost"}
        onClick={() => setTheme("light")}
        className={cn(
          "h-8 px-3 text-xs gap-1.5 font-medium transition-all",
          theme === "light" && "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
        )}
      >
        <Sun className="h-3.5 w-3.5" />
        Light
      </Button>

      <Button
        size="sm"
        variant={theme === "dark" ? "default" : "ghost"}
        onClick={() => setTheme("dark")}
        className={cn(
          "h-8 px-3 text-xs gap-1.5 font-medium transition-all",
          theme === "dark" && "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
        )}
      >
        <Moon className="h-3.5 w-3.5" />
        Dark
      </Button>

      <Button
        size="sm"
        variant={theme === "system" ? "default" : "ghost"}
        onClick={() => setTheme("system")}
        className={cn(
          "h-8 px-3 text-xs gap-1.5 font-medium transition-all",
          theme === "system" && "bg-secondary text-foreground shadow-sm"
        )}
      >
        <Monitor className="h-3.5 w-3.5" />
        System
      </Button>
    </div>
  );
}
