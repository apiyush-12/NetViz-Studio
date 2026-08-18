"use client";

import React from "react";
import { Layers, CheckCircle2, XCircle, Zap } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

export function HttpMultiplexingView() {
  const streams = [
    { id: 1, name: "Stream 1: GET /index.html", size: "14.2 KB", status: "Active", color: "bg-blue-500" },
    { id: 3, name: "Stream 3: GET /styles.css", size: "28.5 KB", status: "Active", color: "bg-emerald-500" },
    { id: 5, name: "Stream 5: GET /bundle.js", size: "140 KB", status: "Active", color: "bg-purple-500" },
    { id: 7, name: "Stream 7: GET /hero.webp", size: "85 KB", status: "Active", color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" />
            <span>HTTP Protocol Evolution & Stream Multiplexing</span>
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Compare Head-of-Line (HoL) blocking against concurrent binary stream multiplexing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* HTTP/1.1 */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center justify-between">
              <span>HTTP/1.1 (Sequential)</span>
              <Badge variant="outline" className="text-[10px] text-amber-400">RFC 9112</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 rounded bg-secondary/30 border border-border text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Request 1: /index.html</span>
                <span className="text-emerald-400">Delivered</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-full" />
              </div>

              <div className="flex items-center justify-between text-muted-foreground pt-1">
                <span>Request 2: /styles.css</span>
                <span className="text-amber-400">Blocked (Wait)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400/40 h-full w-1/3 animate-pulse" />
              </div>

              <div className="flex items-center justify-between text-muted-foreground pt-1">
                <span>Request 3: /bundle.js</span>
                <span className="text-destructive">Blocked</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-700 h-full w-0" />
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1 text-destructive">
                <XCircle className="h-3 w-3" />
                <span>Head-of-Line (HoL) Blocking</span>
              </div>
              <div>Single stream per TCP socket; requires 6 parallel TCP connections.</div>
            </div>
          </CardContent>
        </Card>

        {/* HTTP/2 */}
        <Card className="border-border bg-card ring-1 ring-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center justify-between text-primary">
              <span>HTTP/2 (Binary Framing)</span>
              <Badge variant="default" className="text-[10px]">RFC 9113</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 rounded bg-secondary/30 border border-border text-[11px] space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground block">
                Single TCP Connection (:443)
              </span>
              <div className="space-y-1.5">
                {streams.map((s) => (
                  <div key={s.id} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span>{s.name}</span>
                      <span className="text-primary">{s.size}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`${s.color} h-full w-full animate-pulse`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Full Interleaved Multiplexing</span>
              </div>
              <div>HPACK header compression + bidirectional binary frames.</div>
            </div>
          </CardContent>
        </Card>

        {/* HTTP/3 */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center justify-between text-purple-400">
              <span>HTTP/3 (QUIC / UDP)</span>
              <Badge variant="outline" className="text-[10px] text-purple-400">RFC 9114</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 rounded bg-secondary/30 border border-border text-[11px] space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground block">
                UDP Transport + Built-in TLS 1.3
              </span>
              <div className="p-2 rounded bg-background border border-border/50 space-y-1 text-[10px] font-mono">
                <div className="text-emerald-400">0-RTT Connection Resumption</div>
                <div className="text-primary">No Transport HoL Blocking</div>
                <div className="text-purple-400">Seamless Connection Migration</div>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1 text-purple-400">
                <Zap className="h-3 w-3" />
                <span>Zero Round-Trip Time (0-RTT)</span>
              </div>
              <div>Independent streams: packet drop on Stream 1 does not pause Stream 3.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
