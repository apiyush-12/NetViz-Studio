import { generateId } from "@/lib/utils";
import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";
import { createEventBase } from "@/features/protocols/shared/protocol-utils";
import type { OspfRouter, OspfLink, OspfSpfStep } from "./ospf.types";

export function createOspfPacket(
  label: string,
  technicalLabel: string,
  source: string,
  destination: string,
  packetType: "HELLO" | "DBD" | "LSR" | "LSU" | "LSACK",
  useSimpleLabels = true
): Packet {
  const colorMap = {
    HELLO: "syn",
    DBD: "data",
    LSR: "udp",
    LSU: "fin",
    LSACK: "ack",
  };

  return {
    id: generateId("pkt-ospf"),
    protocol: "OSPF",
    label: useSimpleLabels ? label : technicalLabel,
    source,
    destination,
    headers: {
      ipv4: {
        version: 4,
        ttl: 1,
        protocol: "OSPF (89)",
        srcIp: `10.0.0.${source === "R1" ? 1 : source === "R2" ? 2 : source === "R3" ? 3 : 4}`,
        dstIp: packetType === "HELLO" ? "224.0.0.5 (AllSPFRouters)" : "10.0.0.2",
      },
      application: {
        ospfType: packetType,
        version: 2,
        areaId: "0.0.0.0",
        label: useSimpleLabels ? label : technicalLabel,
      },
    },
    size: packetType === "HELLO" ? 44 : packetType === "LSU" ? 128 : 64,
    status: "pending",
    colorKey: colorMap[packetType] ?? "data",
    createdAt: Date.now(),
  };
}

export function buildOspfSimulationSequence(
  routers: OspfRouter[],
  links: OspfLink[],
  spfResultR1: { steps: OspfSpfStep[]; shortestPaths: Record<string, unknown> },
  useSimpleLabels = true
): { events: SimulationEvent[]; packets: Packet[] } {
  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];
  let seq = 0;
  let time = 0;

  // Helper
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
    const base = createEventBase(seq++, time, "ospf");
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

  // 1. Process Init
  addEvt(
    "state-change",
    "R1",
    "R1",
    "01 OSPF Process Started",
    "OSPF routing process initialized on all routers (R1, R2, R3, R4) with Process ID 1.",
    undefined,
    { step: 1, routers: routers.map((r) => r.nodeId) },
    "info"
  );

  // 2. Interfaces Enabled
  addEvt(
    "configuration-changed",
    "R1",
    "R1",
    "02 Router Interfaces OSPF-Enabled",
    "Interfaces assigned to Area 0. Periodic Hello timers (10s) and Dead timers (40s) activated.",
    undefined,
    { step: 2 },
    "info"
  );

  // 3. Hello Sent (R1 -> R2, R1 -> R3)
  const pktHello1 = createOspfPacket("Hello", "OSPF HELLO", "R1", "R2", "HELLO", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R1",
    "R2",
    "03 R1 Sends Hello to R2",
    "R1 multicasts an OSPF Hello packet out interface GigabitEthernet0/1 to discover neighbors.",
    pktHello1,
    { packetType: "HELLO", routerId: "1.1.1.1", area: "0" }
  );

  const pktHello2 = createOspfPacket("Hello", "OSPF HELLO", "R1", "R3", "HELLO", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R1",
    "R3",
    "03 R1 Sends Hello to R3",
    "R1 multicasts an OSPF Hello packet out interface GigabitEthernet0/2 toward R3.",
    pktHello2,
    { packetType: "HELLO", routerId: "1.1.1.1", area: "0" }
  );

  // 4. Hello Received
  addEvt(
    "packet-arrived",
    "R1",
    "R2",
    "04 R2 Receives Hello from R1",
    "R2 receives Hello, verifies Area 0 match, subnet match, and timer compatibility.",
    pktHello1,
    { step: 4, verified: true },
    "success"
  );

  // 5. Neighbor Discovery -> Init
  addEvt(
    "neighbor-discovered",
    "R2",
    "R1",
    "05 Neighbor State Becomes Init",
    "R2 adds R1 to its neighbor table in Init state (R2 has received R1's Hello, but R1 has not seen R2 yet).",
    undefined,
    { neighborId: "1.1.1.1", state: "init" }
  );

  // 6. 2-Way State
  const pktHelloReply = createOspfPacket("Hello", "OSPF HELLO", "R2", "R1", "HELLO", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R2",
    "R1",
    "06 R2 Responds with Hello Listing R1",
    "R2 sends Hello packet listing R1 (1.1.1.1) in its Active Neighbor list.",
    pktHelloReply,
    { state: "2-way" }
  );

  addEvt(
    "state-change",
    "R1",
    "R2",
    "06 Neighbor State Becomes 2-Way",
    "Bidirectional communication established! Both routers see each other in their Hello packets.",
    undefined,
    { neighborId: "2.2.2.2", state: "2-way" },
    "success"
  );

  // 7. Adjacency Formation (ExStart)
  const pktDbdInit = createOspfPacket("Database Description", "OSPF DBD (Init)", "R1", "R2", "DBD", useSimpleLabels);
  addEvt(
    "handshake-step",
    "R1",
    "R2",
    "07 Adjacency Formation Begins (ExStart)",
    "Routers enter ExStart state. Master/Slave relationship and initial sequence number negotiated.",
    pktDbdInit,
    { state: "exstart" }
  );

  // 8. Database Exchange
  const pktDbdSummary = createOspfPacket("Database Description", "OSPF DBD", "R2", "R1", "DBD", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R2",
    "R1",
    "08 Database Exchange Starts (Exchange)",
    "Routers exchange DBD packets describing the summary headers of all LSAs in their local databases.",
    pktDbdSummary,
    { state: "exchange" }
  );

  // 9. LSR & LSU Exchange (Loading)
  const pktLsr = createOspfPacket("Link-State Request", "OSPF LSR", "R1", "R2", "LSR", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R1",
    "R2",
    "09 Requesting Missing LSAs (Loading)",
    "R1 requests missing link-state entries using Link-State Request (LSR) packets.",
    pktLsr,
    { state: "loading" }
  );

  const pktLsu = createOspfPacket("Link-State Update", "OSPF LSU", "R2", "R1", "LSU", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R2",
    "R1",
    "09 Sending Link-State Updates (LSU)",
    "R2 responds with Link-State Update (LSU) packets containing full Type-1 Router LSAs.",
    pktLsu,
    { state: "loading" }
  );

  const pktLsaAck = createOspfPacket("Link-State Ack", "OSPF LSAck", "R1", "R2", "LSACK", useSimpleLabels);
  addEvt(
    "acknowledgement-sent",
    "R1",
    "R2",
    "09 Acknowledging Received LSAs (LSAck)",
    "R1 sends Link-State Acknowledgment (LSAck) to confirm reliable delivery of LSAs.",
    pktLsaAck,
    { state: "loading" }
  );

  // 10. Adjacency Full
  addEvt(
    "state-change",
    "R1",
    "R2",
    "10 Neighbor State Reaches Full",
    "Adjacency formed! R1 and R2 have synchronized Link-State Databases (LSDB).",
    undefined,
    { neighborId: "2.2.2.2", state: "full" },
    "success"
  );

  // 11. LSA Flooding
  const pktFlood = createOspfPacket("Link-State Update", "OSPF LSU (Flood)", "R2", "R4", "LSU", useSimpleLabels);
  addEvt(
    "packet-sent",
    "R2",
    "R4",
    "11 LSAs Flood Through OSPF Area 0",
    "Type-1 Router LSAs flood through all adjacent links to build a complete topology graph.",
    pktFlood,
    { flooded: true }
  );

  // 12. LSDB Updated
  addEvt(
    "state-change",
    "R4",
    "R4",
    "12 All Routers Update LSDB",
    "Every router in Area 0 stores identical LSDB topology representations.",
    undefined,
    { lsdbSynced: true },
    "success"
  );

  // 13. Dijkstra SPF Calculation
  addEvt(
    "route-calculated",
    "R1",
    "R1",
    "13 SPF Calculation Begins",
    "Dijkstra's Shortest Path First algorithm evaluates link costs (R1-R2=10, R1-R3=5, R2-R4=5, R3-R4=20).",
    undefined,
    { spfSteps: spfResultR1.steps }
  );

  // 14. Shortest Path Selected
  addEvt(
    "route-updated",
    "R1",
    "R4",
    "14 Shortest Path Selected: R1 → R2 → R4 (Cost 15)",
    "Dijkstra chooses Path R1 → R2 → R4 (Cost: 10 + 5 = 15) over Path R1 → R3 → R4 (Cost: 5 + 20 = 25).",
    undefined,
    { path: ["R1", "R2", "R4"], cost: 15 },
    "success"
  );

  // 15. Convergence
  addEvt(
    "simulation-completed",
    "R1",
    "R4",
    "15 OSPF Domain Reaches Convergence",
    "All routing tables populated. End-to-end traffic between LAN-A and LAN-B can now forward optimally.",
    undefined,
    { converged: true },
    "success"
  );

  return { events, packets };
}
