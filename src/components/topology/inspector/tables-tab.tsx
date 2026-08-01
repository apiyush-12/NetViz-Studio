"use client";

import React, { useState } from "react";
import { NetworkNode } from "@/features/topology/topology-types";
import { Tabs } from "@/components/ui";
import { ArpTable } from "../tables/arp-table";
import { MacAddressTable } from "../tables/mac-address-table";
import { RoutingTable } from "../tables/routing-table";
import { OspfNeighborTable } from "../tables/ospf-neighbor-table";
import { BgpTable } from "../tables/bgp-table";
import { DhcpLeaseTable } from "../tables/dhcp-lease-table";

interface TablesTabProps {
  node: NetworkNode;
}

export function TablesTab({ node }: TablesTabProps) {
  const [subTab, setSubTab] = useState("arp");

  const subTabs = [
    { id: "arp", label: "ARP Cache" },
    { id: "mac", label: "MAC Table" },
    { id: "routing", label: "Routing Table" },
    { id: "ospf", label: "OSPF" },
    { id: "bgp", label: "BGP" },
    { id: "dhcp", label: "DHCP Leases" },
  ];

  return (
    <div className="space-y-3 p-4 text-xs">
      <Tabs value={subTab} onValueChange={setSubTab} tabs={subTabs} />

      <div className="pt-2">
        {subTab === "arp" && <ArpTable entries={node.arpTable || []} />}
        {subTab === "mac" && <MacAddressTable entries={node.macTable || []} />}
        {subTab === "routing" && <RoutingTable entries={node.routingTable || []} />}
        {subTab === "ospf" && <OspfNeighborTable neighbors={node.ospfNeighbors || []} />}
        {subTab === "bgp" && <BgpTable routes={node.bgpRoutes || []} />}
        {subTab === "dhcp" && <DhcpLeaseTable leases={node.dhcpLeases || []} />}
      </div>
    </div>
  );
}
