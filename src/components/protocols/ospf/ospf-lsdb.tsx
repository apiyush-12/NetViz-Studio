"use client";

import React, { useState } from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { OspfRouter } from "@/features/protocols/ospf/ospf.types";

interface OspfLsdbViewProps {
  routers: OspfRouter[];
  selectedRouterId: string;
  onSelectRouter: (routerId: string) => void;
}

export function OspfLsdbView({
  routers,
  selectedRouterId,
  onSelectRouter,
}: OspfLsdbViewProps) {
  const activeRouter = routers.find((r) => r.nodeId === selectedRouterId) ?? routers[0];
  const lsdb = activeRouter?.lsdb ?? [];
  const [selectedLsaId, setSelectedLsaId] = useState<string | null>(lsdb[0]?.id ?? null);

  return (
    <div className="space-y-4">
      {/* Router LSDB Selector Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">View LSDB on:</span>
          {routers.map((r) => (
            <button
              key={r.nodeId}
              onClick={() => onSelectRouter(r.nodeId)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md border font-mono font-medium transition-colors cursor-pointer",
                selectedRouterId === r.nodeId
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-border hover:bg-accent"
              )}
            >
              {r.nodeId} ({r.routerId})
            </button>
          ))}
        </div>
        <Badge variant="outline">Area 0 · Type-1 Router LSAs</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        {/* LSDB Graph / Tree Representation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Link-State Database (LSDB) Graph</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              {lsdb.map((lsa) => {
                const isSelected = selectedLsaId === lsa.id;
                const advRouter = routers.find((r) => r.routerId === lsa.advertisingRouter);

                return (
                  <div
                    key={lsa.id}
                    onClick={() => setSelectedLsaId(lsa.id)}
                    className={cn(
                      "p-3 rounded-lg border text-xs transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary"
                        : "bg-card border-border hover:bg-accent/40"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-primary font-mono">
                        {advRouter?.name ?? `Router ${lsa.advertisingRouter}`}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {lsa.type}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground font-mono text-[11px] mb-2">
                      Adv Router: {lsa.advertisingRouter} · Seq: {lsa.sequenceNumber}
                    </p>

                    {/* Links in LSA */}
                    <div className="space-y-1 font-mono text-[11px] border-t border-border/50 pt-2">
                      {lsa.links.map((link, idx) => (
                        <div key={idx} className="flex items-center justify-between text-muted-foreground">
                          <span className="text-foreground">
                            {link.type === "stub"
                              ? `├── Stub: ${link.linkId}/24`
                              : `├── Neighbor: ${link.linkId}`}
                          </span>
                          <span className="text-blue-400 font-semibold">Cost: {link.metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* LSA Deep Dive Inspector */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">LSA Packet Header</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const activeLsa = lsdb.find((l) => l.id === selectedLsaId) ?? lsdb[0];
              if (!activeLsa) return <p className="text-xs text-muted-foreground">No LSA selected.</p>;

              return (
                <div className="space-y-2 text-xs font-mono">
                  <div className="bg-secondary/50 p-2.5 rounded-lg border border-border space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LSA Type:</span>
                      <span className="text-primary font-semibold">{activeLsa.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Link State ID:</span>
                      <span>{activeLsa.linkStateId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advertising Router:</span>
                      <span className="text-emerald-400">{activeLsa.advertisingRouter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sequence Number:</span>
                      <span>{activeLsa.sequenceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LSA Age:</span>
                      <span>{activeLsa.age} seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Checksum:</span>
                      <span>{activeLsa.checksum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Links Count:</span>
                      <span>{activeLsa.links.length}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-sans pt-1">
                    Every router in Area 0 stores an identical copy of this LSA to run Dijkstra SPF.
                  </p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
