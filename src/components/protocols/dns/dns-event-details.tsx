"use client";

import React from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { SimulationEvent } from "@/features/simulation/simulation-types";
import { getDnsEventExplanation } from "@/features/protocols/dns/dns.explanations";

interface DnsEventDetailsProps {
  event: SimulationEvent | null;
  mode?: "simple" | "advanced";
}

export function DnsEventDetails({ event, mode = "advanced" }: DnsEventDetailsProps) {
  if (!event) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">
        Select a DNS event or step forward in the simulation to view technical resolution details.
      </div>
    );
  }

  const rcode = event.title.includes("NXDOMAIN")
    ? "NXDOMAIN"
    : event.title.includes("SERVFAIL")
      ? "SERVFAIL"
      : undefined;

  const recordType = event.title.includes("CNAME")
    ? "CNAME"
    : event.title.includes("AAAA")
      ? "AAAA"
      : "A";

  const explanation = getDnsEventExplanation(event.type, recordType, rcode, mode);

  return (
    <div className="space-y-3 text-xs">
      <Card className="border-border bg-secondary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="default" className="text-[10px] font-mono">
              Step {event.sequenceNumber} · {event.type}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono text-primary">
              {explanation.rfcReference}
            </Badge>
          </div>
          <CardTitle className="text-sm mt-1">{explanation.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground leading-relaxed">{event.description}</p>

          <div className="p-2.5 bg-card/70 rounded-lg border border-border space-y-1.5 font-mono text-[11px]">
            <span className="font-sans font-semibold text-primary block">Technical Breakdown:</span>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {explanation.technicalDetails.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </div>

          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] space-y-0.5">
            <span className="font-semibold text-amber-400 block">Troubleshooting Tip:</span>
            <ul className="list-disc list-inside text-muted-foreground">
              {explanation.troubleshootingTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
