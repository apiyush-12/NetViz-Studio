import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";
import type { DnsNode, DnsRecordType } from "./dns.types";
import type { DnsResolutionOutcome } from "./dns.resolver";

function createDnsPacket(
  id: string,
  source: string,
  destination: string,
  label: string,
  type: string,
  payloadObj: Record<string, unknown>
): Packet {
  return {
    id,
    protocol: "DNS",
    label,
    source,
    destination,
    headers: {
      udp: {
        srcPort: type.includes("query") ? 53535 : 53,
        dstPort: type.includes("query") ? 53 : 53535,
      },
      application: {
        dnsType: type,
        ...payloadObj,
      },
    },
    payload: JSON.stringify(payloadObj),
    size: 80,
    status: "pending",
    colorKey: type.includes("response") ? "ack" : type.includes("error") ? "nack" : "data",
    createdAt: Date.now(),
  };
}

export function buildDnsSimulationSequence(
  nodes: DnsNode[],
  outcome: DnsResolutionOutcome,
  queryHostname: string,
  queryType: DnsRecordType,
  isTechnicalMode = false
): {
  events: SimulationEvent[];
  packets: Packet[];
} {
  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];
  let seq = 1;
  let timestamp = 0;

  const client = nodes.find((n) => n.type === "client") ?? nodes[0];
  const resolver = nodes.find((n) => n.type === "resolver") ?? nodes[1];

  // 1. Client Query Event
  const pktClientQuery = createDnsPacket(
    `pkt-dns-q-${seq}`,
    client.id,
    resolver.id,
    `DNS Q: ${queryType} ${queryHostname}`,
    "dns-query",
    { queryType, queryHostname, flags: { rd: true, qr: false } }
  );
  packets.push(pktClientQuery);

  events.push({
    id: "evt-dns-client-query",
    timestamp: (timestamp += 100),
    sequenceNumber: seq++,
    type: "packet-sent",
    sourceNodeId: client.id,
    destinationNodeId: resolver.id,
    protocol: "DNS",
    title: isTechnicalMode ? `DNS Standard Query (UDP Port 53) — ${queryType} ${queryHostname}` : `Client Query: ${queryHostname}`,
    description: `Client ${client.name} sends recursive DNS query for '${queryHostname}' (Type: ${queryType}, Class: IN) to Local Resolver ${resolver.ipAddress}.`,
    packetId: pktClientQuery.id,
    status: "completed",
    severity: "info",
  });

  // 2. Cache Hit Handling
  if (outcome.isCacheHit) {
    const pktResponse = createDnsPacket(
      `pkt-dns-r-${seq}`,
      resolver.id,
      client.id,
      `DNS Cache Hit: ${outcome.resolvedRecords[0]?.value ?? "IP"}`,
      "dns-response",
      { answers: outcome.resolvedRecords, flags: outcome.flags }
    );
    packets.push(pktResponse);

    events.push({
      id: "evt-dns-cache-hit",
      timestamp: (timestamp += 200),
      sequenceNumber: seq++,
      type: "packet-arrived",
      sourceNodeId: resolver.id,
      destinationNodeId: client.id,
      protocol: "DNS",
      title: isTechnicalMode ? "DNS Response: Cache HIT (Non-Authoritative Answer)" : "Resolved via Local Cache (0 Hops)",
      description: `Resolver ${resolver.name} found cached record for '${queryHostname}'. Returned ${outcome.resolvedRecords[0]?.value} immediately without external queries.`,
      packetId: pktResponse.id,
      status: "completed",
      severity: "success",
    });

    return { events, packets };
  }

  // 3. Iterative Traversal Steps
  outcome.steps.forEach((step, idx) => {
    if (idx === 0) return; // Client query already captured

    const srcNode = nodes.find((n) => n.id === step.fromNodeId) ?? resolver;
    const dstNode = nodes.find((n) => n.id === step.toNodeId) ?? nodes[nodes.length - 1];

    const pktIter = createDnsPacket(
      `pkt-dns-step-${step.stepIndex}`,
      srcNode.id,
      dstNode.id,
      step.responseType === "ANSWER"
        ? `DNS Answer: ${step.resolvedValue ?? queryHostname}`
        : step.responseType === "CNAME_ALIAS"
          ? `CNAME → ${step.resolvedValue}`
          : `Referral (${dstNode.name})`,
      step.responseType === "ANSWER" ? "dns-response" : "dns-query",
      { step }
    );
    packets.push(pktIter);

    events.push({
      id: `evt-dns-step-${step.stepIndex}`,
      timestamp: (timestamp += 250),
      sequenceNumber: seq++,
      type: step.responseType === "SERVFAIL" ? "packet-dropped" : "packet-arrived",
      sourceNodeId: srcNode.id,
      destinationNodeId: dstNode.id,
      protocol: "DNS",
      title: isTechnicalMode
        ? `Iterative Step ${step.stepIndex}: ${step.responseType} from ${dstNode.name}`
        : `${dstNode.name} Delegation / Response`,
      description: step.description,
      packetId: pktIter.id,
      status: step.responseType === "SERVFAIL" ? "failed" : "completed",
      severity: step.responseType === "SERVFAIL" ? "error" : step.responseType === "NXDOMAIN" ? "warning" : "info",
    });
  });

  // 4. Final Response to Client
  const pktFinalResp = createDnsPacket(
    `pkt-dns-final-resp`,
    resolver.id,
    client.id,
    outcome.success
      ? `DNS Response: ${outcome.resolvedRecords[outcome.resolvedRecords.length - 1]?.value ?? "IP"}`
      : `DNS Error: ${outcome.rcode}`,
    outcome.success ? "dns-response" : "dns-error",
    { answers: outcome.resolvedRecords, flags: outcome.flags }
  );
  packets.push(pktFinalResp);

  events.push({
    id: "evt-dns-final-response",
    timestamp: (timestamp += 250),
    sequenceNumber: seq++,
    type: outcome.success ? "route-calculated" : "packet-dropped",
    sourceNodeId: resolver.id,
    destinationNodeId: client.id,
    protocol: "DNS",
    title: outcome.success
      ? (isTechnicalMode ? `DNS Standard Response (RCODE: NOERROR, AA=1)` : `Hostname Resolved Successfully`)
      : (isTechnicalMode ? `DNS Error Response (RCODE: ${outcome.rcode})` : `Resolution Failed (${outcome.rcode})`),
    description: outcome.success
      ? `Resolver delivered final resolution for '${queryHostname}' to ${client.name}. Record: ${outcome.resolvedRecords.map((r) => `${r.type} ${r.value}`).join(", ")}.`
      : `Resolver returned RCODE ${outcome.rcode} for '${queryHostname}'.`,
    packetId: pktFinalResp.id,
    status: outcome.success ? "completed" : "failed",
    severity: outcome.success ? "success" : "error",
  });

  return { events, packets };
}
