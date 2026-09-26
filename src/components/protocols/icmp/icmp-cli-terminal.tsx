"use client";

import React, { useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, Button } from "@/components/ui";
import type { IcmpCliLine } from "@/features/protocols/icmp/icmp.types";

interface IcmpCliTerminalProps {
  lines: IcmpCliLine[];
  activeScenarioTitle?: string;
}

export function IcmpCliTerminal({ lines, activeScenarioTitle }: IcmpCliTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCopy = () => {
    const text = lines.map((l) => l.text).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineColor = (type: IcmpCliLine["type"]) => {
    switch (type) {
      case "command":
        return "text-amber-400 font-bold";
      case "success":
        return "text-emerald-400";
      case "error":
        return "text-red-400 font-semibold";
      case "warning":
        return "text-purple-400 font-semibold";
      case "info":
      default:
        return "text-slate-300";
    }
  };

  return (
    <Card className="border-border bg-slate-950 shadow-md flex flex-col font-mono text-xs">
      <CardHeader className="py-2.5 px-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <TerminalIcon className="h-3.5 w-3.5 text-slate-400" />
            <CardTitle className="text-xs font-semibold text-slate-200">
              Host A Terminal Output
            </CardTitle>
            {activeScenarioTitle && (
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                [{activeScenarioTitle}]
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Copy Output"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>

      <div className="p-3 flex-1 overflow-y-auto max-h-[220px]" ref={scrollRef}>
        {lines.length === 0 ? (
          <div className="text-slate-600 text-xs italic">
            Awaiting command execution... Step or play simulation to see live terminal output.
          </div>
        ) : (
          <div className="space-y-1">
            {lines.map((line, idx) => (
              <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${getLineColor(line.type)}`}>
                {line.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
