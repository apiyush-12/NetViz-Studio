import { NetworkTopology, NetworkNode, DhcpLease } from "@/features/topology/topology-types";

export interface DhcpSimulationResult {
  updatedServerNode: NetworkNode | null;
  clientLease: DhcpLease | null;
  events: Array<{
    step: number;
    summary: string;
    explanation: string;
    protocol: "DHCP";
    sourceNodeId: string;
    destNodeId?: string;
  }>;
}

export function runDhcpSimulation(
  topology: NetworkTopology,
  clientNodeId: string,
  serverNodeId?: string
): DhcpSimulationResult {
  const clientNode = topology.nodes.find((n) => n.id === clientNodeId);
  const serverNode = serverNodeId
    ? topology.nodes.find((n) => n.id === serverNodeId)
    : topology.nodes.find(
        (n) => n.type === "dhcp-server" || n.protocolConfiguration.dhcp?.enabled
      );

  if (!clientNode || !serverNode || !serverNode.protocolConfiguration.dhcp?.enabled) {
    return {
      updatedServerNode: null,
      clientLease: null,
      events: [
        {
          step: 1,
          summary: "DHCP Request Failed",
          explanation: "No active DHCP server node found in network topology to service client request.",
          protocol: "DHCP",
          sourceNodeId: clientNodeId,
        },
      ],
    };
  }

  const pool = serverNode.protocolConfiguration.dhcp.pools[0];
  if (!pool) {
    return {
      updatedServerNode: null,
      clientLease: null,
      events: [
        {
          step: 1,
          summary: "DHCP Pool Exhausted / Missing",
          explanation: `DHCP server ${serverNode.name} has no address pool configured.`,
          protocol: "DHCP",
          sourceNodeId: clientNodeId,
        },
      ],
    };
  }

  const clientMac = clientNode.interfaces[0]?.macAddress || "02:00:00:00:00:10";

  // Calculate next lease IP in pool
  const currentLeases = serverNode.protocolConfiguration.dhcp.leases || [];
  const assignedIp = pool.startAddress.replace(/\.\d+$/, `.${10 + currentLeases.length}`);

  const newLease: DhcpLease = {
    macAddress: clientMac,
    ipAddress: assignedIp,
    clientHostname: clientNode.name,
    leaseStarts: Date.now(),
    leaseExpires: Date.now() + pool.leaseDurationSeconds * 1000,
    state: "active",
  };

  const events: DhcpSimulationResult["events"] = [
    {
      step: 1,
      summary: "DHCP DISCOVER (Broadcast)",
      explanation: `Client ${clientNode.name} broadcasts DHCP DISCOVER frame (src MAC: ${clientMac}, dst MAC: ff:ff:ff:ff:ff:ff) looking for DHCP server.`,
      protocol: "DHCP",
      sourceNodeId: clientNode.id,
    },
    {
      step: 2,
      summary: "DHCP OFFER (Unicast)",
      explanation: `DHCP Server ${serverNode.name} offers IP ${assignedIp}/${pool.prefixLength}, Gateway ${pool.gateway}, DNS ${pool.dnsServer} to client ${clientNode.name}.`,
      protocol: "DHCP",
      sourceNodeId: serverNode.id,
      destNodeId: clientNode.id,
    },
    {
      step: 3,
      summary: "DHCP REQUEST (Broadcast)",
      explanation: `Client ${clientNode.name} broadcasts DHCP REQUEST requesting offered IP ${assignedIp}.`,
      protocol: "DHCP",
      sourceNodeId: clientNode.id,
      destNodeId: serverNode.id,
    },
    {
      step: 4,
      summary: "DHCP ACK (Unicast & Lease Created)",
      explanation: `DHCP Server ${serverNode.name} acknowledges request and registers lease for ${clientNode.name} (${assignedIp}) for ${pool.leaseDurationSeconds} seconds.`,
      protocol: "DHCP",
      sourceNodeId: serverNode.id,
      destNodeId: clientNode.id,
    },
  ];

  const updatedServerNode = JSON.parse(JSON.stringify(serverNode)) as NetworkNode;
  updatedServerNode.protocolConfiguration.dhcp!.leases = [...currentLeases, newLease];

  return {
    updatedServerNode,
    clientLease: newLease,
    events,
  };
}
