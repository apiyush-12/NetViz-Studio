"use client";

import React from "react";
import { BookOpen, Shield, CheckCircle2, Wrench } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { getIpv4EventExplanation } from "@/features/protocols/ipv4/ipv4.explanations";
import { Ipv4HeaderInspector } from "./ipv4-header-inspector";
import type { Ipv4SimulationEvent } from "@/features/protocols/ipv4/ipv4.types";

interface Ipv4EventDetailsProps {
  event?: Ipv4SimulationEvent;
}

export function Ipv4EventDetails({ event }: Ipv4EventDetailsProps) {
  if (!event) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
        Select an IPv4 forwarding event from the timeline below to inspect RFC explanations and header bitfields.
      </div>
    );
  }

  const explanation = getIpv4EventExplanation(event.type);

  return (
    <div className="space-y-3 text-xs">
      {/* Event Header Banner */}
      <Card className="border-border bg-secondary/30 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="default" className="text-[10px] font-mono">
              Step {event.step} · {event.type.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono text-primary">
              {event.rfcReference}
            </Badge>
          </div>
          <CardTitle className="text-sm font-bold text-foreground mt-1">
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {event.explanation}
          </p>
        </CardContent>
      </Card>

      {/* Header Bitfield Inspector */}
      <Ipv4HeaderInspector header={event.headerSnapshot} />

      {/* Technical Breakdown */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-1.5">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            <span>RFC Technical Specifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <ul className="space-y-1">
            {explanation.technicalDetails.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-muted-foreground text-[11px]">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Troubleshooting Tips */}
      {explanation.troubleshootingTips.length > 0 && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-amber-400">
              <Wrench className="h-3.5 w-3.5" />
              <span>Network Troubleshooting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {explanation.troubleshootingTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-muted-foreground text-[11px]">
                  <span className="text-amber-400">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Security Notes */}
      {explanation.securityNotes.length > 0 && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Security & Ingress Filtering</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {explanation.securityNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-muted-foreground text-[11px]">
                  <span className="text-emerald-400">✓</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
