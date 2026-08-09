import { generateId } from "@/lib/utils";
import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";
import { createEventBase } from "@/features/protocols/shared/protocol-utils";
import type { BgpRouter, BgpLink, BgpRoute } from "./bgp.types";

export function createBgpPacket(
  label: string,
  technicalLabel: string,
  source: string,
  destination: string,
  packetType: "OPEN" | "UPDATE" | "KEEPALIVE" | "NOTIFICATION" | "WITHDRAWAL",
  useSimpleLabels = true
): Packet {
  const colorMap = {
    OPEN: "syn",
    UPDATE: "fin",
    KEEPALIVE: "ack",
    NOTIFICATION: "drop",
    WITHDRAWAL: "drop",
  };

  return {
    id: generateId("pkt-bgp"),
    protocol: "BGP",
    label: useSimpleLabels ? label : technicalLabel,
    source,
    destination,
    headers: {
      tcp: {
        srcPort: 179,
        dstPort: 179,
        flags: "PSH, ACK",
      },
      ipv4: {
        version: 4,
        ttl: 64,
        protocol: "TCP (6)",
        srcIp: "192.0.2.1",
        dstIp: "192.0.2.2",
      },
      application: {
        bgpType: packetType,
        version: 4,
        label: useSimpleLabels ? label : technicalLabel,
      },
    },
    size: packetType === "UPDATE" ? 120 : packetType === "OPEN" ? 45 : 19,
    status: "pending",
    colorKey: colorMap[packetType] ?? "data",
    createdAt: Date.now(),
  };
}

export function buildBgpSimulationSequence(
  routers: BgpRouter[],
  links: BgpLink[],
  bestRouteAtR1: BgpRoute | null,
  useSimpleLabels = true,
  isWithdrawal = false
): { events: SimulationEvent[]; packets: Packet[] } {
  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];
  let seq = 0;
  let time = 0;

  const addEvt = (
    type: SimulationEvent["type"],
    sourceNodeId: string,
    destinationNodeId: string,
    title: string,
    description: string,
    pkt?: Packet,
    payload?: Record<string, unknown>,
    severity: SimulationEvent["severity"] = "info"
  ) => {
    const base = createEventBase(seq++, time, "bgp");
    time += 350;
    if (pkt) packets.push(pkt);
    events.push({
      ...base,
      type,
      sourceNodeId,
      destinationNodeId,
      title,
      description,
      packetId: pkt?.id,
      payload,
      severity,
    });
  };

  // 1. BGP Process Started
  addEvt(
    "state-change",
    "R1",
    "R1",
    "01 BGP Process Started",
    "BGP routing process initialized on all routers across Autonomous Systems (AS 65001, AS 65002, AS 65003, AS 65004).",
    undefined,
    { step: 1 },
    "info"
  );

  // 2. TCP Connection Attempt
  addEvt(
    "handshake-step",
    "R1",
    "R2",
    "02 TCP Port 179 Connection Initiated",
    "R1 initiates TCP connection toward peer R2 (192.0.2.2) and R3 (192.0.2.6). Session state moves to Connect.",
    undefined,
    { state: "connect" }
  );

  // 3. OPEN Sent & Received
  const pktOpenR1R2 = createBgpPacket("Open Session", "BGP OPEN", "R1", "R2", "OPEN", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R1",
    "R2",
    "03 BGP OPEN Message Sent to R2",
    "R1 sends BGP OPEN message containing Local AS 65001, BGP Identifier 1.1.1.1, and Hold Time 90s.",
    pktOpenR1R2,
    { type: "OPEN", localAsn: 65001, holdTime: 90 }
  );

  const pktOpenR2R1 = createBgpPacket("Open Session", "BGP OPEN", "R2", "R1", "OPEN", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R2",
    "R1",
    "04 BGP OPEN Received from R2",
    "R2 responds with BGP OPEN containing Local AS 65002. Parameters validated successfully.",
    pktOpenR2R1,
    { type: "OPEN", remoteAsn: 65002 },
    "success"
  );

  // 4. KEEPALIVE Exchange
  const pktKeepalive = createBgpPacket("Keep Session Alive", "BGP KEEPALIVE", "R1", "R2", "KEEPALIVE", useSimpleLabels);
  addEvt(
    "acknowledgement-sent",
    "R1",
    "R2",
    "05 BGP KEEPALIVE Exchanged",
    "Peers exchange KEEPALIVE messages to confirm session parameters. State transitions to OpenConfirm.",
    pktKeepalive,
    { state: "openconfirm" }
  );

  // 5. Session Established
  addEvt(
    "state-change",
    "R1",
    "R2",
    "06 Peering Session Reaches Established",
    "eBGP peering session is now ESTABLISHED! Prefix updates and route advertisements can begin.",
    undefined,
    { state: "established" },
    "success"
  );

  if (isWithdrawal) {
    const pktWithdraw = createBgpPacket("Withdraw Route", "BGP UPDATE (Withdraw)", "R4", "R2", "WITHDRAWAL", useSimpleLabels);
    addEvt(
      "packet-sent",
      "R4",
      "R2",
      "07 Prefix 203.0.113.0/24 Withdrawn",
      "R4 withdraws advertised prefix. UPDATE packet containing Withdrawn Routes field is propagated.",
      pktWithdraw,
      { withdrawnPrefix: "203.0.113.0/24" },
      "warning"
    );

    addEvt(
      "route-updated",
      "R1",
      "R1",
      "08 Routes Removed from BGP RIB",
      "Peers remove withdrawn prefix from their BGP table and flush forwarding entries.",
      undefined,
      { flushed: true },
      "warning"
    );
    return { events, packets };
  }

  // 6. Prefix Origination at R4
  const pktUpdateR4R2 = createBgpPacket("Advertise Route", "BGP UPDATE", "R4", "R2", "UPDATE", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R4",
    "R2",
    "07 Prefix 203.0.113.0/24 Advertised by AS 65004",
    "R4 originates prefix 203.0.113.0/24 with AS_PATH [65004] and sends UPDATE to R2 and R3.",
    pktUpdateR4R2,
    { prefix: "203.0.113.0/24", asPath: [65004] }
  );

  // 7. Route Propagation across eBGP Borders
  const pktUpdateR2R1 = createBgpPacket("Advertise Route", "BGP UPDATE", "R2", "R1", "UPDATE", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R2",
    "R1",
    "08 R2 Advertises Path A (AS_PATH: 65002 65004, LOCAL_PREF: 200)",
    "R2 prepends AS 65002 to AS_PATH, assigns LOCAL_PREF 200, and advertises route to R1.",
    pktUpdateR2R1,
    { asPath: [65002, 65004], localPref: 200, med: 100 }
  );

  const pktUpdateR3R1 = createBgpPacket("Advertise Route", "BGP UPDATE", "R3", "R1", "UPDATE", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R3",
    "R1",
    "09 R3 Advertises Path B (AS_PATH: 65003 65004, LOCAL_PREF: 100)",
    "R3 prepends AS 65003 to AS_PATH, assigns LOCAL_PREF 100, and advertises route to R1.",
    pktUpdateR3R1,
    { asPath: [65003, 65004], localPref: 100, med: 20 }
  );

  // 8. Best Path Decision Process
  addEvt(
    "route-calculated",
    "R1",
    "R1",
    "10 BGP Best-Path Decision Algorithm Begins",
    "R1 received multiple candidate paths to 203.0.113.0/24. Evaluating vendor-neutral decision rules (LOCAL_PREF, AS_PATH, MED).",
    undefined,
    { evaluating: true }
  );

  // 9. Best Path Selected
  const winningName = bestRouteAtR1?.nextHop === "192.0.2.2" ? "Path A (via R2)" : "Path B (via R3)";
  const winningAsPath = bestRouteAtR1?.asPath.join(" ") ?? "65002 65004";
  addEvt(
    "route-updated",
    "R1",
    "R1",
    `11 Best Path Selected: ${winningName}`,
    `Path A selected: Higher LOCAL_PREF (${bestRouteAtR1?.localPreference}) is evaluated before AS_PATH or MED. Marked as *> BEST in BGP RIB.`,
    undefined,
    { bestPath: winningName, asPath: winningAsPath },
    "success"
  );

  // 10. Convergence
  addEvt(
    "simulation-completed",
    "R1",
    "R4",
    "12 BGP Domain Reaches Convergence",
    "IP routing table updated with active eBGP next-hop. Outbound traffic to 203.0.113.0/24 forwards over optimal policy path.",
    undefined,
    { converged: true },
    "success"
  );

  return { events, packets };
}
