"use client";

import React, { useState } from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BgpRouter } from "@/features/protocols/bgp/bgp.types";

interface BgpRouteTableProps {
  router: BgpRouter;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
}

export function BgpRouteTable({
  router,
  selectedRouteId,
  onSelectRoute,
}: BgpRouteTableProps) {
  const [inspectedRejection, setInspectedRejection] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">
            {router.name} (AS {router.localAsn}) — BGP Table (RIB)
          </CardTitle>
          <Badge variant="outline">
            Legend: <span className="text-emerald-400 font-mono font-bold ml-1">*&gt;</span> Best ·{" "}
            <span className="text-blue-400 font-mono font-bold ml-1">*</span> Valid
          </Badge>
        </CardHeader>
        <CardContent>
          {router.bgpTable.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No prefixes currently in BGP Routing Information Base (RIB).
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left font-sans">
                    <th className="py-2">Status</th>
                    <th className="py-2">Network Prefix</th>
                    <th className="py-2">Next Hop</th>
                    <th className="py-2">LOCAL_PREF</th>
                    <th className="py-2">AS_PATH</th>
                    <th className="py-2">ORIGIN</th>
                    <th className="py-2">MED</th>
                    <th className="py-2">Best</th>
                    <th className="py-2 font-sans">Decision Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {router.bgpTable.map((route) => {
                    const isSelected = selectedRouteId === route.id;

                    return (
                      <tr
                        key={route.id}
                        onClick={() => {
                          onSelectRoute(route.id);
                          if (route.rejectionReason) {
                            setInspectedRejection(route.rejectionReason);
                          } else {
                            setInspectedRejection(null);
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          route.best
                            ? "bg-emerald-500/10 hover:bg-emerald-500/15"
                            : isSelected
                              ? "bg-primary/15 font-semibold text-primary"
                              : "hover:bg-accent/40"
                        )}
                      >
                        <td className="py-2 font-bold">
                          {route.best ? (
                            <span className="text-emerald-400">*&gt;</span>
                          ) : route.valid ? (
                            <span className="text-blue-400">*</span>
                          ) : (
                            <span className="text-destructive">x</span>
                          )}
                        </td>
                        <td className="py-2 font-medium text-foreground">{route.prefix}</td>
                        <td className="py-2 text-muted-foreground">{route.nextHop}</td>
                        <td className="py-2 text-blue-400 font-bold">{route.localPreference}</td>
                        <td className="py-2 text-foreground">{route.asPath.join(" ")}</td>
                        <td className="py-2 uppercase text-muted-foreground">{route.origin}</td>
                        <td className="py-2 text-muted-foreground">{route.med}</td>
                        <td className="py-2">
                          <Badge
                            variant={route.best ? "success" : "outline"}
                            className="text-[10px]"
                          >
                            {route.best ? "YES" : "NO"}
                          </Badge>
                        </td>
                        <td className="py-2 font-sans text-[11px] text-muted-foreground">
                          {route.best ? (
                            <span className="text-emerald-400 font-semibold">Selected Best Route</span>
                          ) : (
                            <span className="text-amber-400 cursor-pointer underline">
                              Why not selected?
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deep-Dive Rejection Reason Modal / Box */}
      {inspectedRejection && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-xs space-y-1">
          <span className="font-semibold text-amber-300 block">
            Why was this candidate path not selected?
          </span>
          <p className="text-muted-foreground leading-relaxed">{inspectedRejection}</p>
        </div>
      )}
    </div>
  );
}
