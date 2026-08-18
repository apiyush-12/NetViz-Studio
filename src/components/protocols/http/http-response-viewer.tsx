"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock, HardDrive, Copy, Check, ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge, Button, Tabs } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { HttpResponseData } from "@/features/protocols/http/http.types";

interface HttpResponseViewerProps {
  response: HttpResponseData;
}

export function HttpResponseViewer({ response }: HttpResponseViewerProps) {
  const [activeTab, setActiveTab] = useState("body");
  const [copied, setCopied] = useState(false);

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (code >= 300 && code < 400) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
    if (code >= 400 && code < 500) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    if (code >= 500) return "text-red-400 border-red-500/40 bg-red-500/10";
    return "text-destructive border-destructive/40 bg-destructive/10";
  };

  const getStatusIcon = (code: number) => {
    if (code >= 200 && code < 300) return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (code >= 300 && code < 400) return <Clock className="h-4 w-4 text-blue-400" />;
    if (code >= 400 && code < 500) return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };

  const handleCopy = () => {
    if (!response.body) return;
    navigator.clipboard.writeText(response.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-xl bg-card p-3 shadow-sm space-y-3">
      {/* Response Header Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-1.5", getStatusColor(response.statusCode))}
          >
            {getStatusIcon(response.statusCode)}
            <span>{response.statusCode} {response.statusText}</span>
          </Badge>

          {response.tlsSessionEstablished ? (
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] gap-1 font-mono">
              <ShieldCheck className="h-3 w-3" /> TLS 1.3
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px] gap-1 font-mono">
              <ShieldAlert className="h-3 w-3" /> Insecure HTTP
            </Badge>
          )}

          {response.cached && (
            <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 bg-cyan-500/10 text-[10px] font-mono">
              ⚡ Cache HIT
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {response.timeMs} ms
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3.5 w-3.5 text-primary" />
            {response.contentLength} B
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy Body"}
          </Button>
        </div>
      </div>

      {/* Tabs: Body / HTML Preview / Headers */}
      <div className="space-y-2 pt-1 border-t border-border/50">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          tabs={[
            { id: "body", label: "Response Body" },
            { id: "preview", label: "Rendered Preview" },
            { id: "headers", label: `Headers (${Object.keys(response.headers).length})` },
          ]}
        />

        {/* Tab 1: Formatted JSON/Text Body */}
        {activeTab === "body" && (
          <div className="relative">
            <pre className="max-h-[220px] overflow-y-auto p-3 rounded-lg border border-border bg-slate-950/80 font-mono text-xs text-emerald-400/90 leading-relaxed">
              {response.body || (
                <span className="text-muted-foreground italic">&lt;No Response Body Returned / Status 204 or 304&gt;</span>
              )}
            </pre>
          </div>
        )}

        {/* Tab 2: Rendered HTML / SVG Preview */}
        {activeTab === "preview" && (
          <div className="max-h-[220px] overflow-y-auto p-3 rounded-lg border border-border bg-background flex items-center justify-center min-h-[120px]">
            {response.contentType.includes("html") ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none w-full"
                dangerouslySetInnerHTML={{ __html: response.body }}
              />
            ) : response.contentType.includes("svg") ? (
              <div dangerouslySetInnerHTML={{ __html: response.body }} />
            ) : (
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">JSON Application Payload</p>
                <div className="inline-block p-2 rounded bg-card border border-border font-mono text-xs text-primary">
                  Status: {response.statusCode} {response.statusText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Response Headers Table */}
        {activeTab === "headers" && (
          <div className="max-h-[220px] overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 border-b border-border text-[11px] font-semibold text-muted-foreground">
                <tr>
                  <th className="p-2">Header Name</th>
                  <th className="p-2">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {Object.entries(response.headers).map(([key, value]) => (
                  <tr key={key} className="hover:bg-accent/30">
                    <td className="p-2 font-medium text-primary">{key}</td>
                    <td className="p-2 text-foreground/80 break-all">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
