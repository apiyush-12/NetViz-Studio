import type { SimulationEvent, Packet } from "@/features/simulation/simulation-types";
import type {
  MplsConfig,
  MplsNode,
  MplsLink,
  MplsSimulationStepState,
  MplsSimulationOutcome,
  MplsPacketData,
  MplsShimHeader,
} from "./mpls.types";
import {
  createMplsShimHeader,
  pushLabel,
  swapTopLabel,
  applyPenultimateHopPopping,
  processTtl,
} from "./mpls-engine";
import { MPLS_PRESETS } from "./mpls.defaults";

export function generateMplsEventSequence(config: MplsConfig): MplsSimulationOutcome {
  const preset = MPLS_PRESETS[config.topologyPreset] || MPLS_PRESETS.standard_core_lsp;
  const initialNodes: MplsNode[] = JSON.parse(JSON.stringify(preset.nodes));
  const initialLinks: MplsLink[] = JSON.parse(JSON.stringify(preset.links));

  const events: SimulationEvent[] = [];
  const packets: Packet[] = [];
  const steps: MplsSimulationStepState[] = [];

  let currentIpTtl = 64;
  let currentMplsTtl = 64;

  const exp = config.trafficClassExp;

  if (config.scenarioId === "basic_push_swap_pop") {
    // ----------------------------------------------------
    // Scenario 1: Basic Core LSP (Push, Swap, Pop)
    // ----------------------------------------------------
    // Step 0: CE-1 generates native IP packet destined for CE-2 (10.2.2.2)
    const p0: MplsPacketData = {
      id: "pkt-mpls-1",
      sourceIp: "10.1.1.2",
      destIp: "10.2.2.2",
      ipTtl: 64,
      payloadType: "ICMP_ECHO",
      payloadSummary: "ICMP Echo Request (Ping: 10.1.1.2 -> 10.2.2.2)",
      labelStack: [],
      currentOperation: "UNTAG",
      operationDescription: "CE-1 transmits standard IPv4 packet to default gateway PE-1",
      ingressPort: "Gi0/0",
      egressPort: "Gi0/0",
    };

    steps.push({
      step: 0,
      title: "1. CE-1 Originates Native IPv4 Datagram",
      description: "Host CE-1 creates a standard IPv4 ICMP Echo Request destined for 10.2.2.2 with IP TTL=64 and no MPLS labels.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: ["link-ce1-pe1"],
      activeNodeId: "ce-1",
      highlightedLspNodeIds: ["ce-1", "pe-1"],
      eventExplanation: {
        beginner: "Customer Edge 1 (CE-1) wants to send data to CE-2. It sends standard IP traffic to its local provider router.",
        advanced: "CE-1 emits an untagged Ethernet II frame (EtherType 0x0800) destined for next-hop gateway 10.1.1.1 (PE-1).",
        protocolRule: "Customer Edge devices run standard IP and are unaware of MPLS forwarding in the provider core.",
        fieldsChanged: ["Packet: Native IPv4", "EtherType: 0x0800", "TTL: 64"],
      },
    });

    // Step 1: PE-1 Ingress PUSH Label 101
    const { newIpTtl, newMplsTtl } = processTtl(64, 64, config.ttlMode, "PUSH");
    currentIpTtl = newIpTtl;
    currentMplsTtl = newMplsTtl;

    const stack1: MplsShimHeader[] = pushLabel([], 101, exp, currentMplsTtl, "Transport LDP (101)");
    const p1: MplsPacketData = {
      ...p0,
      ipTtl: currentIpTtl,
      labelStack: stack1,
      currentOperation: "PUSH",
      operationDescription: "PE-1 performs FIB lookup for 10.2.2.0/24 -> Imposes MPLS Label 101",
      ingressPort: "Gi0/0",
      egressPort: "Gi0/1",
    };

    steps.push({
      step: 1,
      title: "2. Ingress PE-1 Imposes Label 101 (PUSH)",
      description: "PE-1 classifies 10.2.2.2 into FEC 10.2.2.0/24, queries its FIB/CEF, and prepends an RFC 3032 32-bit shim header with Label 101.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p1,
      activeLinkIds: ["link-pe1-p1"],
      activeNodeId: "pe-1",
      highlightedLspNodeIds: ["pe-1", "p-1"],
      eventExplanation: {
        beginner: "Ingress Router PE-1 attaches a 32-bit digital barcode (Label 101) to the packet. Now core routers won't need to read the long IP address.",
        advanced: "PE-1 resolves FTN (FEC-to-NHLFE) for prefix 10.2.2.0/24. It imposes top label 101 (S=1, EXP=0, TTL=63), sets EtherType to 0x8847, and forwards out Gi0/1.",
        protocolRule: "RFC 3031 Section 3.1: Label imposition occurs at the ingress edge of an MPLS domain.",
        fieldsChanged: ["Label: 101 (PUSH)", "S-Bit: 1 (Bottom of Stack)", "EtherType: 0x8847 (MPLS Unicast)"],
      },
    });

    // Step 2: P-1 Core SWAP Label 101 -> 201
    const ttlSwap1 = processTtl(currentIpTtl, currentMplsTtl, config.ttlMode, "SWAP");
    currentMplsTtl = ttlSwap1.newMplsTtl;
    const stack2 = swapTopLabel(stack1, 201, "Transport LDP (201)");
    stack2[0].ttl = currentMplsTtl;

    const p2: MplsPacketData = {
      ...p1,
      labelStack: stack2,
      currentOperation: "SWAP",
      operationDescription: "P-1 looks up Label 101 in LFIB -> Swaps to Outgoing Label 201",
      ingressPort: "Gi0/1",
      egressPort: "Gi0/2",
    };

    steps.push({
      step: 2,
      title: "3. Core LSR P-1 Swaps Label (101 -> 201)",
      description: "Router P-1 performs an exact-match index lookup of Label 101 in its LFIB table, replaces it with Label 201, decrements TTL, and forwards out Gi0/2.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p2,
      activeLinkIds: ["link-p1-p2"],
      activeNodeId: "p-1",
      highlightedLspNodeIds: ["p-1", "p-2"],
      eventExplanation: {
        beginner: "Core Router P-1 trades token #101 for token #201 in high-speed hardware without ever opening the packet.",
        advanced: "P-1 references its ILM (Incoming Label Map). LFIB row: In-Label 101 -> Action SWAP -> Out-Label 201, Next-Hop 10.0.2.2 (P-2), Out-Interface Gi0/2. MPLS TTL decremented to 62.",
        protocolRule: "RFC 3031 Section 3.2: Label switching routers perform O(1) indexed lookups on top label only.",
        fieldsChanged: ["Label: 101 -> 201 (SWAP)", "MPLS TTL: 62"],
      },
    });

    // Step 3: P-2 Core SWAP Label 201 -> 301 (or PHP if disabled)
    const ttlSwap2 = processTtl(currentIpTtl, currentMplsTtl, config.ttlMode, "SWAP");
    currentMplsTtl = ttlSwap2.newMplsTtl;
    const stack3 = swapTopLabel(stack2, 301, "Transport LDP (301)");
    stack3[0].ttl = currentMplsTtl;

    const p3: MplsPacketData = {
      ...p2,
      labelStack: stack3,
      currentOperation: "SWAP",
      operationDescription: "P-2 looks up Label 201 in LFIB -> Swaps to Outgoing Label 301",
      ingressPort: "Gi0/1",
      egressPort: "Gi0/2",
    };

    steps.push({
      step: 3,
      title: "4. Penultimate Router P-2 Swaps Label (201 -> 301)",
      description: "Router P-2 indexes incoming Label 201 in LFIB, replaces it with Label 301, decrements MPLS TTL, and transmits to Egress PE-2.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p3,
      activeLinkIds: ["link-p2-pe2"],
      activeNodeId: "p-2",
      highlightedLspNodeIds: ["p-2", "pe-2"],
      eventExplanation: {
        beginner: "Router P-2 replaces token #201 with token #301 and forwards it to the final provider router PE-2.",
        advanced: "P-2 swaps incoming label 201 to outgoing label 301 as advertised by downstream peer 4.4.4.4 (PE-2).",
        protocolRule: "LSP hops maintain label consistency via downstream-unsolicited LDP bindings.",
        fieldsChanged: ["Label: 201 -> 301 (SWAP)", "MPLS TTL: 61"],
      },
    });

    // Step 4: PE-2 Egress POP Label 301
    const ttlPop = processTtl(currentIpTtl, currentMplsTtl, config.ttlMode, "POP");
    currentIpTtl = ttlPop.newIpTtl;

    const p4: MplsPacketData = {
      ...p3,
      ipTtl: currentIpTtl,
      labelStack: [],
      currentOperation: "POP",
      operationDescription: "PE-2 terminates LSP -> Pops Label 301 and routes native IP",
      ingressPort: "Gi0/0",
      egressPort: "Gi0/1",
    };

    steps.push({
      step: 4,
      title: "5. Egress PE-2 Strips Label (POP) & Forwards IP",
      description: "Egress PE-2 looks up Label 301 in LFIB, strips the 32-bit MPLS shim header (POP), and forwards native IPv4 to destination CE-2.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p4,
      activeLinkIds: ["link-pe2-ce2"],
      activeNodeId: "pe-2",
      highlightedLspNodeIds: ["pe-2", "ce-2"],
      eventExplanation: {
        beginner: "The destination provider router PE-2 removes the barcode label, revealing the original clean IP packet, and passes it to CE-2.",
        advanced: "PE-2 receives EtherType 0x8847, looks up Label 301 (Action: POP / Untag), strips the 4-byte header, updates EtherType to 0x0800, and performs FIB lookup for 10.2.2.2.",
        protocolRule: "RFC 3031 Section 3.3: Egress LER terminates the LSP and performs native IP routing to customer CE.",
        fieldsChanged: ["Label: 301 (POP)", "EtherType: 0x0800 (IPv4)", "IP TTL: " + currentIpTtl],
      },
    });

    // Step 5: CE-2 receives native packet
    steps.push({
      step: 5,
      title: "6. CE-2 Receives ICMP Echo Request",
      description: "Destination CE-2 receives the standard untagged IPv4 datagram and processes the ICMP Echo Request.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: {
        ...p4,
        currentOperation: "UNTAG",
        operationDescription: "Packet delivered successfully to CE-2",
      },
      activeLinkIds: [],
      activeNodeId: "ce-2",
      highlightedLspNodeIds: ["ce-2"],
      eventExplanation: {
        beginner: "Destination site receives the ping packet smoothly! The entire MPLS core did all the heavy lifting in record time.",
        advanced: "CE-2 processes ICMP Echo Request (Type 8, Code 0) without any trace of provider MPLS encapsulation.",
        protocolRule: "End-to-end transparent Layer 3 delivery across an MPLS core.",
        fieldsChanged: ["Status: Delivered", "Total Core Hops: 3"],
      },
    });
  } else if (config.scenarioId === "php_implicit_null") {
    // ----------------------------------------------------
    // Scenario 2: Penultimate Hop Popping (PHP - Label 3)
    // ----------------------------------------------------
    const p0: MplsPacketData = {
      id: "pkt-mpls-php-1",
      sourceIp: "10.1.1.2",
      destIp: "10.2.2.2",
      ipTtl: 64,
      payloadType: "ICMP_ECHO",
      payloadSummary: "ICMP Echo (PHP Test: 10.1.1.2 -> 10.2.2.2)",
      labelStack: [],
      currentOperation: "UNTAG",
      operationDescription: "CE-1 transmits standard IPv4 packet to PE-1",
    };

    steps.push({
      step: 0,
      title: "1. CE-1 Generates IPv4 Packet",
      description: "Host CE-1 transmits standard IPv4 traffic to Ingress PE-1.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: ["link-ce1-pe1"],
      activeNodeId: "ce-1",
      highlightedLspNodeIds: ["ce-1", "pe-1"],
      eventExplanation: {
        beginner: "CE-1 starts sending data toward PE-1.",
        advanced: "CE-1 outputs untagged IPv4 frame to 10.1.1.1.",
        protocolRule: "Non-MPLS CE node emits standard IPv4 frames.",
      },
    });

    // Step 1: PE-1 Ingress PUSH Label 101
    const stack1 = pushLabel([], 101, exp, 63, "Transport LDP (101)");
    const p1: MplsPacketData = {
      ...p0,
      labelStack: stack1,
      currentOperation: "PUSH",
      operationDescription: "PE-1 imposes Label 101 for FEC 10.2.2.0/24",
    };

    steps.push({
      step: 1,
      title: "2. Ingress PE-1 Pushes Label 101",
      description: "PE-1 imposes Label 101 for destination prefix 10.2.2.0/24 and forwards to Core P-1.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p1,
      activeLinkIds: ["link-pe1-p1"],
      activeNodeId: "pe-1",
      highlightedLspNodeIds: ["pe-1", "p-1"],
      eventExplanation: {
        beginner: "PE-1 attaches Label 101 and launches the packet into the provider backbone.",
        advanced: "Ingress LER performs FTN mapping and encapsulates payload with 32-bit MPLS shim.",
        protocolRule: "RFC 3031: Ingress label imposition.",
      },
    });

    // Step 2: P-1 Core SWAP Label 101 -> 201
    const stack2 = swapTopLabel(stack1, 201, "Transport LDP (201)");
    stack2[0].ttl = 62;
    const p2: MplsPacketData = {
      ...p1,
      labelStack: stack2,
      currentOperation: "SWAP",
      operationDescription: "P-1 swaps Label 101 -> 201 toward P-2",
    };

    steps.push({
      step: 2,
      title: "3. Core P-1 Swaps Label (101 -> 201)",
      description: "P-1 looks up Label 101 in LFIB, replaces it with Label 201, and sends to Penultimate Router P-2.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p2,
      activeLinkIds: ["link-p1-p2"],
      activeNodeId: "p-1",
      highlightedLspNodeIds: ["p-1", "p-2"],
      eventExplanation: {
        beginner: "Core router P-1 swaps 101 to 201 and passes it along to P-2.",
        advanced: "LFIB swap operation executed in hardware pipeline; TTL decremented to 62.",
        protocolRule: "RFC 3031: Core label switching.",
      },
    });

    // Step 3: P-2 Penultimate Hop POP (Implicit Null Label 3 signaled by PE-2)
    const stack3 = applyPenultimateHopPopping(stack2);
    const p3: MplsPacketData = {
      ...p2,
      labelStack: stack3,
      currentOperation: "PHP",
      operationDescription: "P-2 performs PHP! Pops outer label because PE-2 advertised Implicit Null (Label 3)",
    };

    steps.push({
      step: 3,
      title: "4. P-2 Executes Penultimate Hop Popping (PHP)",
      description: "Because PE-2 advertised Implicit Null (reserved Label 3) for this FEC, P-2 strips the outer MPLS shim header completely before sending to PE-2.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p3,
      activeLinkIds: ["link-p2-pe2"],
      activeNodeId: "p-2",
      highlightedLspNodeIds: ["p-2", "pe-2"],
      eventExplanation: {
        beginner: "CRITICAL OPTIMIZATION: Router P-2 notices that the next stop is the final destination PE-2. To save PE-2 from having to do two lookups, P-2 pops off the label right here!",
        advanced: "P-2 checks LFIB entry for In-Label 201. The Out-Label is IMPLICIT_NULL (Label 3). P-2 pops the top label and sends native IPv4 (EtherType 0x0800) to PE-2. Label 3 itself NEVER appears on the wire.",
        protocolRule: "RFC 3036 / RFC 5036: Penultimate Hop Popping (PHP) eliminates double lookup overhead at egress PE.",
        fieldsChanged: ["Operation: PHP (POP)", "Wire Label: None (Untagged IPv4)", "EtherType: 0x0800"],
      },
    });

    // Step 4: PE-2 receives native IP and forwards to CE-2
    steps.push({
      step: 4,
      title: "5. PE-2 Performs Single Direct IP Route Lookup",
      description: "PE-2 receives pure native IPv4 directly from P-2, performs a single FIB lookup, and forwards to CE-2 without any MPLS overhead.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: {
        ...p3,
        currentOperation: "UNTAG",
        operationDescription: "PE-2 forwards directly to CE-2",
      },
      activeLinkIds: ["link-pe2-ce2"],
      activeNodeId: "pe-2",
      highlightedLspNodeIds: ["pe-2", "ce-2"],
      eventExplanation: {
        beginner: "Thanks to PHP, PE-2 only had to look up the IP address once instead of doing a label lookup followed by an IP lookup. Double lookup eliminated!",
        advanced: "PE-2 processes native IPv4 frame directly via CEF FIB and transmits out Gi0/1 to CE-2.",
        protocolRule: "PHP optimization delivers maximum throughput and lowest egress latency.",
        fieldsChanged: ["Egress Lookup Count: 1 (Reduced from 2)"],
      },
    });

    // Step 5: CE-2 received
    steps.push({
      step: 5,
      title: "6. CE-2 Receives Packet Successfully",
      description: "Destination CE-2 receives the packet intact.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: { ...p3, currentOperation: "UNTAG", operationDescription: "Delivered to CE-2" },
      activeLinkIds: [],
      activeNodeId: "ce-2",
      highlightedLspNodeIds: ["ce-2"],
      eventExplanation: {
        beginner: "Packet delivered with maximum efficiency!",
        advanced: "Transaction complete with PHP optimization verified.",
        protocolRule: "RFC 5036 PHP complete.",
      },
    });
  } else if (config.scenarioId === "l3vpn_multi_tenant_traffic") {
    // ----------------------------------------------------
    // Scenario 3: BGP/MPLS L3VPN Multi-Tenant (Two-Label Stack)
    // ----------------------------------------------------
    const isRed = config.customerVrf === "VRF_RED_CUSTOMER_A" || config.customerVrf === "GLOBAL_IP";
    const custName = isRed ? "Acme Corp (VRF_RED)" : "Globex Corp (VRF_BLUE)";
    const sourceCeId = isRed ? "ce-red-1" : "ce-blue-1";
    const targetCeId = isRed ? "ce-red-2" : "ce-blue-2";
    const vpnLabel = isRed ? 501 : 502;
    const vrfName = isRed ? "VRF_RED_CUSTOMER_A" : "VRF_BLUE_CUSTOMER_B";

    const p0: MplsPacketData = {
      id: "pkt-l3vpn-1",
      sourceIp: "192.168.1.2",
      destIp: "192.168.2.2",
      customerName: custName,
      vrfName,
      ipTtl: 64,
      payloadType: "TCP_DATA",
      payloadSummary: `Encrypted Payroll Data (${custName}: 192.168.1.2 -> 192.168.2.2)`,
      labelStack: [],
      currentOperation: "UNTAG",
      operationDescription: `${custName} Site 1 transmits private corporate data to PE-1`,
    };

    steps.push({
      step: 0,
      title: `1. ${custName} Transmits Private IPv4 Traffic`,
      description: `${custName} transmits customer packet from Site 1 (192.168.1.2) destined for Site 2 (192.168.2.2).`,
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: [isRed ? "link-ce-red1-pe1" : "link-ce-blue1-pe1"],
      activeNodeId: sourceCeId,
      highlightedLspNodeIds: [sourceCeId, "pe-1"],
      eventExplanation: {
        beginner: `Customer ${custName} sends confidential internal network traffic into the ISP cloud.`,
        advanced: `Packet ingresses PE-1 on dedicated customer sub-interface mapped to ${vrfName}.`,
        protocolRule: "RFC 4364: VRF-lite customer attachment circuit.",
      },
    });

    // Step 1: PE-1 Imposes 2-Label Stack: Top=Transport (101), Bottom=VPN (501 or 502)
    const stack1: MplsShimHeader[] = [
      createMplsShimHeader(101, exp, false, 63, "Transport LDP (101)"), // Top: S=0
      createMplsShimHeader(vpnLabel, exp, true, 64, `VPN MP-BGP (${vpnLabel})`), // Bottom: S=1
    ];

    const p1: MplsPacketData = {
      ...p0,
      labelStack: stack1,
      currentOperation: "STACK_PUSH",
      operationDescription: `PE-1 imposes TWO Labels: [Outer Transport: 101 (S=0)] + [Inner VPN: ${vpnLabel} (S=1)]`,
    };

    steps.push({
      step: 1,
      title: `2. PE-1 Imposes Two-Label Stack (Transport 101 + VPN ${vpnLabel})`,
      description: `PE-1 performs VRF route lookup: pushes Inner VPN Label ${vpnLabel} (allocated by MP-BGP for ${vrfName}) with S=1, and Outer Transport Label 101 (allocated by LDP for PE-2 Loopback 4.4.4.4) with S=0.`,
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p1,
      activeLinkIds: ["link-pe1-p1"],
      activeNodeId: "pe-1",
      highlightedLspNodeIds: ["pe-1", "p-1"],
      eventExplanation: {
        beginner: `PE-1 puts TWO labels on the packet: Outer label gets it to the correct city (PE-2), Inner label gets it to the correct company (${custName}).`,
        advanced: `Two-label imposition: Top Label 101 (Transport LDP, S=0) + Bottom Label ${vpnLabel} (VPN MP-BGP, S=1). Core routers will only ever inspect the top label!`,
        protocolRule: "RFC 4364 Section 3.1: Hierarchical 2-label stack for BGP/MPLS L3VPNs.",
        fieldsChanged: [`Top Label: 101 (S=0)`, `Bottom Label: ${vpnLabel} (S=1)`, "Stack Depth: 2 Labels"],
      },
    });

    // Step 2: Core P-1 Swaps Top Transport Label (101 -> 201), Inner Label Untouched
    const stack2: MplsShimHeader[] = [
      createMplsShimHeader(201, exp, false, 62, "Transport LDP (201)"),
      stack1[1], // Inner VPN label untouched!
    ];

    const p2: MplsPacketData = {
      ...p1,
      labelStack: stack2,
      currentOperation: "SWAP",
      operationDescription: `P-1 swaps Top Label 101 -> 201. Inner VPN Label ${vpnLabel} remains untouched!`,
    };

    steps.push({
      step: 2,
      title: `3. Core P-1 Swaps Top Label (101 -> 201)`,
      description: `P-1 looks up top label 101 in LFIB and swaps to 201. P-1 NEVER inspects or alters the inner VPN label ${vpnLabel} or the customer payload.`,
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p2,
      activeLinkIds: ["link-p1-p2"],
      activeNodeId: "p-1",
      highlightedLspNodeIds: ["p-1", "p-2"],
      eventExplanation: {
        beginner: "Core router P-1 only swaps the outer shipping label. It has zero idea what company's data is hidden inside.",
        advanced: "BGP-Free Core: Core LSRs maintain zero customer routing state and switch purely based on top LDP transport labels.",
        protocolRule: "RFC 4364 Section 4.2: Scalability via BGP-free provider core.",
        fieldsChanged: ["Top Label: 101 -> 201", `Inner Label: ${vpnLabel} (Preserved)`],
      },
    });

    // Step 3: P-2 Penultimate Hop Popping on Outer Transport Label
    const stack3: MplsShimHeader[] = [
      createMplsShimHeader(vpnLabel, exp, true, 64, `VPN MP-BGP (${vpnLabel})`),
    ];

    const p3: MplsPacketData = {
      ...p2,
      labelStack: stack3,
      currentOperation: "PHP",
      operationDescription: `P-2 performs PHP on Outer Label! Packet now has single remaining label: VPN ${vpnLabel}`,
    };

    steps.push({
      step: 3,
      title: `4. P-2 Pops Outer Transport Label (PHP)`,
      description: `P-2 pops the outer transport label via PHP. The packet arrives at PE-2 with only the inner VPN label ${vpnLabel} (S=1).`,
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p3,
      activeLinkIds: ["link-p2-pe2"],
      activeNodeId: "p-2",
      highlightedLspNodeIds: ["p-2", "pe-2"],
      eventExplanation: {
        beginner: "P-2 removes the outer city shipping label. Now only the inner company department label remains.",
        advanced: "Outer LDP label popped via PHP; bottom-of-stack VPN label exposed with S=1.",
        protocolRule: "RFC 4364: Penultimate hop popping preserves inner VPN label.",
        fieldsChanged: ["Outer Label: Popped", `Remaining Label: ${vpnLabel} (S=1)`],
      },
    });

    // Step 4: PE-2 looks up VPN Label 501/502 -> Routes into customer VRF
    const p4: MplsPacketData = {
      ...p3,
      labelStack: [],
      currentOperation: "POP",
      operationDescription: `PE-2 looks up VPN Label ${vpnLabel} -> Injects into ${vrfName} and delivers to ${targetCeId}`,
    };

    steps.push({
      step: 4,
      title: `5. PE-2 Maps VPN Label ${vpnLabel} to ${vrfName}`,
      description: `PE-2 receives packet with Label ${vpnLabel}, checks its LFIB to find it belongs to ${vrfName}, pops the label, and routes into the customer private link.`,
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p4,
      activeLinkIds: [isRed ? "link-pe2-ce-red2" : "link-pe2-ce-blue2"],
      activeNodeId: "pe-2",
      highlightedLspNodeIds: ["pe-2", targetCeId],
      eventExplanation: {
        beginner: `PE-2 reads inner token #${vpnLabel}, sees it belongs to ${custName}, and securely delivers it directly to ${custName}'s private office!`,
        advanced: `PE-2 LFIB lookup: In-Label ${vpnLabel} -> Target VRF ${vrfName}. Label popped (POP), and packet routed out VRF customer attachment interface.`,
        protocolRule: "RFC 4364 Section 3.2: VRF demultiplexing via MP-BGP VPN label.",
        fieldsChanged: ["VPN Label: Popped", `Target VRF: ${vrfName}`, "Destination: " + targetCeId],
      },
    });

    // Step 5: Customer Site 2 received
    steps.push({
      step: 5,
      title: `6. ${custName} Site 2 Receives Private Data`,
      description: `Target host ${targetCeId} receives native IP data in full security and complete isolation from other tenants.`,
      nodes: initialNodes,
      links: initialLinks,
      activePacket: { ...p4, currentOperation: "UNTAG", operationDescription: "Delivered securely" },
      activeLinkIds: [],
      activeNodeId: targetCeId,
      highlightedLspNodeIds: [targetCeId],
      eventExplanation: {
        beginner: `Data delivered securely to ${custName}! Both companies used the same network and same IP addresses with zero cross-talk.`,
        advanced: "Full multi-tenant cryptographic/L3 isolation achieved across shared provider MPLS infrastructure.",
        protocolRule: "RFC 4364 L3VPN delivery complete.",
      },
    });
  } else if (config.scenarioId === "frr_link_failure_detour") {
    // ----------------------------------------------------
    // Scenario 4: Fast Reroute (FRR) 50ms Bypass Detour
    // ----------------------------------------------------
    const failedLinks: MplsLink[] = initialLinks.map((l) =>
      l.id === "link-pe1-p1" ? { ...l, status: "down" as const } : l
    );

    const p0: MplsPacketData = {
      id: "pkt-frr-1",
      sourceIp: "10.1.1.2",
      destIp: "10.2.2.2",
      ipTtl: 64,
      payloadType: "ICMP_ECHO",
      payloadSummary: "VoIP Stream / Critical Financial Transaction (10.1.1.2 -> 10.2.2.2)",
      labelStack: [],
      currentOperation: "UNTAG",
      operationDescription: "CE-1 transmits time-critical traffic to PE-1",
    };

    steps.push({
      step: 0,
      title: "1. CE-1 Sends Time-Critical Traffic to PE-1",
      description: "Host CE-1 transmits real-time traffic to Ingress PE-1.",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: ["link-ce1-pe1"],
      activeNodeId: "ce-1",
      highlightedLspNodeIds: ["ce-1", "pe-1"],
      eventExplanation: {
        beginner: "Real-time traffic enters PE-1 just as the primary fiber optic link to P-1 suffers a sudden cut!",
        advanced: "Primary LSP trajectory PE1 -> P1 -> P2 -> PE2 is compromised due to physical carrier loss on Gi0/1.",
        protocolRule: "Normal IGP reconvergence takes 2-5 seconds. FRR will protect in <50ms.",
      },
    });

    // Step 1: Link Failure Detected at PE-1 (Point of Local Repair)
    steps.push({
      step: 1,
      title: "2. [FIBER CUT] PE-1 Detects Primary Link Failure",
      description: "Primary link PE1-P1 goes DOWN. PE-1 (Point of Local Repair / PLR) detects the failure via hardware BFD in <10ms and immediately activates pre-computed FRR Bypass LSP.",
      nodes: initialNodes,
      links: failedLinks,
      activePacket: p0,
      activeLinkIds: [],
      activeNodeId: "pe-1",
      highlightedLspNodeIds: ["pe-1"],
      eventExplanation: {
        beginner: "ALARM: The primary cable is cut! Instead of dropping packets or waiting seconds for new routes, PE-1 instantly switches to its backup plan in under 50 milliseconds.",
        advanced: "Point of Local Repair (PLR, PE-1) invokes pre-programmed hardware Fast Reroute (FRR) adjacency detour via backup LSR P-3.",
        protocolRule: "RFC 4090: Fast Reroute Extensions to RSVP-TE for LSP Tunnels.",
        fieldsChanged: ["Link PE1-P1: DOWN", "FRR Detour: ACTIVATED", "Detection Time: <10ms"],
      },
    });

    // Step 2: PE-1 Pushes Bypass Label 901 and redirects to P-3
    const stackFrr1: MplsShimHeader[] = [
      createMplsShimHeader(901, exp, false, 63, "FRR Bypass (901)"), // Top Bypass Label: S=0
      createMplsShimHeader(101, exp, true, 63, "Original Transport (101)"), // Original Label: S=1
    ];

    const p1: MplsPacketData = {
      ...p0,
      labelStack: stackFrr1,
      currentOperation: "STACK_PUSH",
      operationDescription: "PE-1 imposes FRR Bypass Label 901 and routes via P-3 Backup LSR",
      isFrrDetour: true,
    };

    steps.push({
      step: 2,
      title: "3. PE-1 Pushes Bypass Label 901 & Detours via P-3",
      description: "PE-1 imposes a bypass tunnel label (901) on top of the original transport label (101) and transmits out Gi0/2 toward Backup Router P-3.",
      nodes: initialNodes,
      links: failedLinks,
      activePacket: p1,
      activeLinkIds: ["link-pe1-p3"],
      activeNodeId: "pe-1",
      highlightedLspNodeIds: ["pe-1", "p-3-backup"],
      eventExplanation: {
        beginner: "PE-1 adds a backup bypass tag (Label 901) to route the packet around the damaged line via backup router P-3.",
        advanced: "PLR imposes Facility Backup Label 901 (S=0) over original label 101 (S=1) and forwards over alternate interface Gi0/2.",
        protocolRule: "RFC 4090 Section 3.2: Facility backup label stacking.",
        fieldsChanged: ["Bypass Label: 901 (PUSH)", "Detour Interface: Gi0/2 (to P-3)"],
      },
    });

    // Step 3: P-3 Backup LSR Swaps Bypass Label to P-2 (Merge Point)
    const stackFrr2: MplsShimHeader[] = [
      createMplsShimHeader(201, exp, false, 62, "FRR Bypass (201)"),
      stackFrr1[1],
    ];

    const p2: MplsPacketData = {
      ...p1,
      labelStack: stackFrr2,
      currentOperation: "SWAP",
      operationDescription: "P-3 switches bypass traffic toward Merge Point P-2",
      isFrrDetour: true,
    };

    steps.push({
      step: 3,
      title: "4. Backup LSR P-3 Forwards to Merge Point P-2",
      description: "Backup Router P-3 switches the bypass label and transmits the frame to P-2 (the Merge Point / MP).",
      nodes: initialNodes,
      links: failedLinks,
      activePacket: p2,
      activeLinkIds: ["link-p3-p2"],
      activeNodeId: "p-3-backup",
      highlightedLspNodeIds: ["p-3-backup", "p-2"],
      eventExplanation: {
        beginner: "Backup router P-3 guides the packet back onto the main highway at router P-2.",
        advanced: "P-3 executes LFIB swap on bypass label, delivering the packet to the Merge Point (MP, P-2).",
        protocolRule: "RFC 4090: Merge Point reconnection.",
      },
    });

    // Step 4: P-2 Merges back into primary LSP and forwards to PE-2
    const p3: MplsPacketData = {
      ...p2,
      labelStack: [],
      currentOperation: "PHP",
      operationDescription: "P-2 merges traffic and executes PHP toward PE-2",
      isFrrDetour: false,
    };

    steps.push({
      step: 4,
      title: "5. Merge Point P-2 Reconnects to Primary LSP",
      description: "P-2 receives the packet, strips the bypass label, executes PHP for PE-2, and forwards native IP to PE-2 with 0 packet loss.",
      nodes: initialNodes,
      links: failedLinks,
      activePacket: p3,
      activeLinkIds: ["link-p2-pe2"],
      activeNodeId: "p-2",
      highlightedLspNodeIds: ["p-2", "pe-2"],
      eventExplanation: {
        beginner: "Traffic is safely back on the main path! Zero packets were lost despite a complete fiber cut.",
        advanced: "Merge Point P-2 pops bypass encapsulation and continues standard LSP forwarding to PE-2.",
        protocolRule: "RFC 4090: Seamless detour merge.",
      },
    });

    // Step 5: Delivered to CE-2
    steps.push({
      step: 5,
      title: "6. CE-2 Receives Packet with Zero Interruption",
      description: "Destination CE-2 receives the packet seamlessly in under 50 milliseconds.",
      nodes: initialNodes,
      links: failedLinks,
      activePacket: { ...p3, currentOperation: "UNTAG", operationDescription: "Delivered via FRR detour" },
      activeLinkIds: ["link-pe2-ce2"],
      activeNodeId: "ce-2",
      highlightedLspNodeIds: ["ce-2"],
      eventExplanation: {
        beginner: "The call or video stream never dropped because FRR protected the connection instantly.",
        advanced: "Sub-50ms failover SLA achieved using pre-instantiated MPLS-TE Fast Reroute detour.",
        protocolRule: "Carrier-grade 99.999% availability achieved.",
      },
    });
  } else {
    // ----------------------------------------------------
    // Scenario 5 & 6: Traceroute Uniform vs Pipe Mode
    // ----------------------------------------------------
    const isPipe = config.scenarioId === "traceroute_pipe_mode";

    const p0: MplsPacketData = {
      id: "pkt-trace-1",
      sourceIp: "10.1.1.2",
      destIp: "10.2.2.2",
      ipTtl: 30,
      payloadType: "UDP_DATA",
      payloadSummary: `Traceroute Probe (TTL=30, Mode: ${isPipe ? "PIPE" : "UNIFORM"})`,
      labelStack: [],
      currentOperation: "UNTAG",
      operationDescription: `CE-1 initiates traceroute to 10.2.2.2 in ${isPipe ? "Pipe" : "Uniform"} mode`,
    };

    steps.push({
      step: 0,
      title: `1. CE-1 Sends Traceroute Probe (IP TTL=30)`,
      description: `Customer CE-1 initiates a traceroute to CE-2 (10.2.2.2) with IP TTL=30. Mode configured: ${isPipe ? "PIPE MODE" : "UNIFORM MODE"}.`,
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p0,
      activeLinkIds: ["link-ce1-pe1"],
      activeNodeId: "ce-1",
      highlightedLspNodeIds: ["ce-1", "pe-1"],
      eventExplanation: {
        beginner: `CE-1 sends a traceroute probe to discover all routers along the path.`,
        advanced: `Customer generates UDP traceroute probe (dest port 33434) with IP TTL=30.`,
        protocolRule: `RFC 3443: TTL processing in MPLS networks.`,
      },
    });

    const ingressMplsTtl = isPipe ? 255 : 29;
    const ingressIpTtl = 29;
    const stack1 = pushLabel([], 101, exp, ingressMplsTtl, `Transport (${isPipe ? "MPLS TTL=255" : "MPLS TTL=29"})`);

    const p1: MplsPacketData = {
      ...p0,
      ipTtl: ingressIpTtl,
      labelStack: stack1,
      currentOperation: "PUSH",
      operationDescription: isPipe
        ? "Pipe Mode: IP TTL=29 is HIDDEN inside packet; MPLS TTL initialized to 255"
        : "Uniform Mode: IP TTL=29 is COPIED directly into MPLS TTL=29",
    };

    steps.push({
      step: 1,
      title: `2. PE-1 Ingress TTL Processing (${isPipe ? "Pipe Mode" : "Uniform Mode"})`,
      description: isPipe
        ? "PIPE MODE: PE-1 decrements IP TTL to 29, but sets MPLS TTL to 255. The customer's IP TTL is protected and invisible inside the core."
        : "UNIFORM MODE: PE-1 decrements IP TTL to 29 and COPIES it into the MPLS shim header (MPLS TTL=29).",
      nodes: initialNodes,
      links: initialLinks,
      activePacket: p1,
      activeLinkIds: ["link-pe1-p1"],
      activeNodeId: "pe-1",
      highlightedLspNodeIds: ["pe-1", "p-1"],
      eventExplanation: {
        beginner: isPipe
          ? "In Pipe Mode, the ISP wraps the customer's packet in a protective tunnel so the customer cannot see internal ISP routers."
          : "In Uniform Mode, the customer's counter is copied directly to the outer tag, exposing internal routers.",
        advanced: isPipe
          ? "RFC 3443 Section 3.2 (Pipe Model): Ingress PE encapsulates IP packet, preserving customer IP TTL=29. MPLS TTL initialized independently to 255."
          : "RFC 3443 Section 3.1 (Uniform Model): Ingress PE copies decremented IP TTL (29) directly into top MPLS label TTL.",
        protocolRule: isPipe ? "Pipe Mode: Core topology hidden." : "Uniform Mode: Core topology visible to traceroute.",
        fieldsChanged: [isPipe ? "MPLS TTL: 255 (Encapsulated)" : "MPLS TTL: 29 (Mirrored)", "IP TTL: 29"],
      },
    });

    // Core transit steps
    const core1MplsTtl = isPipe ? 254 : 28;
    const stack2 = swapTopLabel(stack1, 201, `Transport (TTL=${core1MplsTtl})`);
    stack2[0].ttl = core1MplsTtl;

    steps.push({
      step: 2,
      title: `3. Core P-1 Decrements MPLS TTL (${core1MplsTtl})`,
      description: isPipe
        ? `P-1 decrements MPLS TTL from 255 to 254. Customer IP TTL (29) remains untouched.`
        : `P-1 decrements MPLS TTL from 29 to 28. If TTL hit 0, P-1 would send an ICMP TTL Exceeded message revealing its IP (10.0.1.2) to the customer.`,
      nodes: initialNodes,
      links: initialLinks,
      activePacket: { ...p1, labelStack: stack2, currentOperation: "SWAP" },
      activeLinkIds: ["link-p1-p2"],
      activeNodeId: "p-1",
      highlightedLspNodeIds: ["p-1", "p-2"],
      eventExplanation: {
        beginner: isPipe
          ? "Core router P-1 decrements the ISP's private timer without touching the customer's timer."
          : "Core router P-1 decrements the timer. In a real traceroute probe, P-1's IP address is revealed to the user.",
        advanced: isPipe
          ? "Core LSR only modifies top MPLS shim TTL. Inner IP payload is not inspected."
          : "Uniform mode allows customer traceroute to map provider core hops.",
        protocolRule: "RFC 3443 Core TTL processing.",
      },
    });

    // Egress delivery
    const finalIpTtl = isPipe ? 29 : 26;
    steps.push({
      step: 3,
      title: `4. Egress PE-2 TTL Restoration (${isPipe ? "Pipe Mode: 1-Hop Virtual Link" : "Uniform Mode: 4-Hop Path"})`,
      description: isPipe
        ? `PIPE MODE: PE-2 pops the MPLS label. The customer IP TTL emerges as 29 (decremented only once across the entire ISP domain!). Customer traceroute sees 1 hop.`
        : `UNIFORM MODE: PE-2 copies the decremented MPLS TTL (26) back into the IP TTL. Customer traceroute sees all 4 provider hops!`,
      nodes: initialNodes,
      links: initialLinks,
      activePacket: {
        ...p0,
        ipTtl: finalIpTtl,
        labelStack: [],
        currentOperation: "POP",
        operationDescription: isPipe
          ? "Pipe Mode: Entire MPLS core appears as a single hop (IP TTL=29)"
          : "Uniform Mode: All core hops reflected in IP TTL (IP TTL=26)",
      },
      activeLinkIds: ["link-pe2-ce2"],
      activeNodeId: "pe-2",
      highlightedLspNodeIds: ["pe-2", "ce-2"],
      eventExplanation: {
        beginner: isPipe
          ? "To the customer, the entire ISP network looked like a single 1-hop magic cable! Perfect privacy."
          : "To the customer, every single router along the path was listed. Great for ISP network debugging.",
        advanced: isPipe
          ? "Pipe mode hides provider internal addressing and prevents customer traceroutes from leaking core router loopbacks."
          : "Uniform mode synchronizes TTL across L3/L2.5 boundaries for end-to-end hop visibility.",
        protocolRule: "RFC 3443 Section 3: Uniform vs Pipe TTL semantics.",
        fieldsChanged: [`Final IP TTL: ${finalIpTtl}`, `Apparent Hops: ${isPipe ? "1 Hop (Hidden)" : "4 Hops (Visible)"}`],
      },
    });
  }

  // Populate events and packets arrays for platform compatibility
  steps.forEach((step, idx) => {
    const src = step.activeNodeId || "pe-1";
    const tgt = step.highlightedLspNodeIds[1] || "p-1";

    events.push({
      id: `mpls-evt-${idx}`,
      timestamp: idx * 1000,
      sequenceNumber: idx + 1,
      type: "packet-sent",
      sourceNodeId: src,
      destinationNodeId: tgt,
      protocol: "mpls",
      title: step.title,
      description: step.description,
      status: "completed",
      severity: "info",
    });

    if (step.activePacket) {
      packets.push({
        id: `mpls-pkt-${idx}`,
        label: `MPLS [${step.activePacket.labelStack.map((s) => s.label).join("|") || "IP"}]`,
        source: step.activePacket.sourceIp,
        destination: step.activePacket.destIp,
        protocol: step.activePacket.labelStack.length > 0 ? "MPLS" : "IPv4",
        size: 64 + step.activePacket.labelStack.length * 4,
        status: "delivered",
        colorKey: step.activePacket.labelStack.length > 0 ? "blue" : "emerald",
        createdAt: idx * 1000,
        headers: {
          ethernet: {
            etherType: step.activePacket.labelStack.length > 0 ? "0x8847" : "0x0800",
            labelCount: step.activePacket.labelStack.length,
          },
          ipv4: {
            src: step.activePacket.sourceIp,
            dst: step.activePacket.destIp,
            ttl: step.activePacket.ipTtl,
          },
        },
        payload: step.activePacket.payloadSummary,
      });
    }
  });

  return {
    events,
    packets,
    steps,
    finalNodes: initialNodes,
    finalLinks: initialLinks,
  };
}
