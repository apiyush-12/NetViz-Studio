"use client";

import React from "react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { OspfRouter } from "@/features/protocols/ospf/ospf.types";

interface OspfRoutingTableProps {
  router: OspfRouter;
  selectedRouteDestination: string | null;
  onSelectRoute: (destination: string, path: string[]) => void;
}

export function OspfRoutingTable({
  router,
  selectedRouteDestination,
  onSelectRoute,
}: OspfRoutingTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">
          {router.name} ({router.routerId}) — IP Routing Table
        </CardTitle>
        <Badge variant="outline">AD = 110 (OSPF) / 0 (Connected)</Badge>
      </CardHeader>
      <CardContent>
        {router.routingTable.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No routes installed in routing table.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-2">Source</th>
                  <th className="py-2">Destination Prefix</th>
                  <th className="py-2">Next Hop IP</th>
                  <th className="py-2">Metric / Cost</th>
                  <th className="py-2">Exit Interface</th>
                  <th className="py-2">SPT Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {router.routingTable.map((route) => {
                  const isSelected = selectedRouteDestination === route.destination;

                  return (
                    <tr
                      key={route.destination}
                      onClick={() => onSelectRoute(route.destination, route.path)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary/15 font-semibold text-primary"
                          : "hover:bg-accent/40"
                      )}
                    >
                      <td className="py-2">
                        <Badge
                          variant={route.source === "OSPF" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {route.source === "OSPF" ? "O" : "C"}
                        </Badge>
                      </td>
                      <td className="py-2 font-medium">{route.destination}</td>
                      <td className="py-2 text-muted-foreground">{route.nextHop}</td>
                      <td className="py-2 text-blue-400 font-semibold">{route.cost}</td>
                      <td className="py-2 text-muted-foreground">{route.exitInterface}</td>
                      <td className="py-2 text-muted-foreground font-sans text-[11px]">
                        {route.path.join(" → ")}
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
  );
}
