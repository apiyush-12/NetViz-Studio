"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Globe, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

interface HttpHeadersInspectorProps {
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  isHttps?: boolean;
}

export function HttpHeadersInspector({
  requestHeaders,
  responseHeaders,
}: HttpHeadersInspectorProps) {
  const hasHsts = Boolean(responseHeaders["Strict-Transport-Security"]);
  const hasCors = Boolean(responseHeaders["Access-Control-Allow-Origin"]);
  const hasNosniff = responseHeaders["X-Content-Type-Options"] === "nosniff";
  const hasFrameOptions = Boolean(responseHeaders["X-Frame-Options"]);

  return (
    <div className="space-y-4 text-xs">
      {/* Security Headers Audit Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-lg border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">HSTS Policy</span>
            {hasHsts ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            {hasHsts ? "Enforced (max-age 1yr)" : "Disabled"}
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">CORS Policy</span>
            {hasCors ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            {hasCors ? responseHeaders["Access-Control-Allow-Origin"] : "Same-Origin"}
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">MIME Sniffing</span>
            {hasNosniff ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            {hasNosniff ? "X-Content-Type-Options" : "Vulnerable"}
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Clickjacking</span>
            {hasFrameOptions ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            {hasFrameOptions ? responseHeaders["X-Frame-Options"] : "Not Protected"}
          </span>
        </div>
      </div>

      {/* Side-by-Side Request vs Response Headers Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Request Headers */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-primary">
              <Globe className="h-3.5 w-3.5" />
              <span>Client Request Headers ({Object.keys(requestHeaders).length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[220px] overflow-y-auto divide-y divide-border/50 text-[11px] font-mono">
              {Object.entries(requestHeaders).map(([key, val]) => (
                <div key={key} className="p-2 hover:bg-accent/30 flex items-start justify-between gap-2">
                  <span className="text-primary shrink-0">{key}:</span>
                  <span className="text-foreground/80 break-all text-right">{val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Headers */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400">
              <Database className="h-3.5 w-3.5" />
              <span>Server Response Headers ({Object.keys(responseHeaders).length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[220px] overflow-y-auto divide-y divide-border/50 text-[11px] font-mono">
              {Object.entries(responseHeaders).map(([key, val]) => (
                <div key={key} className="p-2 hover:bg-accent/30 flex items-start justify-between gap-2">
                  <span className="text-emerald-400 shrink-0">{key}:</span>
                  <span className="text-foreground/80 break-all text-right">{val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
