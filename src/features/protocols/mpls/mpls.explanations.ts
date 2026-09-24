import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export const MPLS_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "MPLS_INGRESS_PUSH",
    beginner: {
      whatHappened: "Ingress Router PE-1 attaches an MPLS tracking label to the incoming IP packet.",
      whyItHappened:
        "Instead of inspecting destination IP addresses at every single core router, PE-1 classifies the packet once and attaches a fast 32-bit label token.",
      protocolRule: "Label imposition occurs at the ingress edge of an MPLS domain.",
      fieldsChanged: ["Label: 101 (PUSH)", "S-Bit: 1 (Bottom of Stack)", "EtherType: 0x8847"],
      whatHappensNext: "Packet is transmitted out to Core Router P-1 for hardware label switching.",
      realWorldUse: "Used by all major telecom providers to interconnect branch offices and data centers.",
    },
    advanced: {
      whatHappened: "FEC Classification, FTN (FEC-to-NHLFE) resolution, and Label Imposition (RFC 3031 / RFC 3032).",
      whyItHappened:
        "The Ingress LER maps incoming destination IPv4 prefixes to a Forwarding Equivalence Class (FEC) and queries the FIB to resolve the Next Hop Label Forwarding Entry (NHLFE).",
      protocolRule: "RFC 3031 Section 3.1: Label imposition binds incoming FEC to an outgoing label and interface.",
      fieldsChanged: ["MPLS Label: 101", "EXP: 0", "S-Bit: 1", "MPLS TTL: 63", "EtherType: 0x8847"],
      whatHappensNext: "Frame enters the MPLS domain with EtherType 0x8847 directed to Core LSR P-1.",
      realWorldUse: "Enterprise MPLS VPN carrier networks and Internet Service Provider transit backbones.",
    },
  },
  {
    eventType: "MPLS_CORE_SWAP",
    beginner: {
      whatHappened: "Core Router P-1 swaps the incoming label for a new outgoing label in hardware.",
      whyItHappened:
        "Core routers switch packets purely based on small label numbers in fast ASIC memory without ever reading the IP address.",
      protocolRule: "Core routers perform constant-time exact-match lookups on the top label.",
      fieldsChanged: ["Label: 101 -> 201 (SWAP)", "MPLS TTL: 62"],
      whatHappensNext: "The packet travels across the provider backbone to Router P-2.",
      realWorldUse: "Enables multi-terabit backbone routers to switch traffic at line rate.",
    },
    advanced: {
      whatHappened: "ILM (Incoming Label Map) indexed lookup, Label Replacement, and TTL decrement (RFC 3031).",
      whyItHappened:
        "P-1 indexes the incoming label 101 into its LFIB (Label Forwarding Information Base), swaps it with label 201 advertised by downstream LDP peer 3.3.3.3, and decrements TTL.",
      protocolRule: "RFC 3031 Section 3.2: Exact O(1) indexed lookup in Incoming Label Map (ILM).",
      fieldsChanged: ["In-Label: 101", "Out-Label: 201", "TTL: -1 (62)", "Payload: Untouched"],
      whatHappensNext: "Transmitted out Gi0/2 toward downstream peer P-2.",
      realWorldUse: "High-speed core transit across global Tier-1 Internet backbones.",
    },
  },
  {
    eventType: "MPLS_PHP_POP",
    beginner: {
      whatHappened: "Penultimate Hop Popping: The router just before the destination removes the outer label.",
      whyItHappened:
        "Removing the label early prevents the final router (PE-2) from having to do two lookups (label lookup + IP lookup), speeding up the entire network.",
      protocolRule: "Penultimate Hop Popping eliminates double lookups at the egress router.",
      fieldsChanged: ["Operation: PHP (POP)", "Wire Label: None", "EtherType: 0x0800"],
      whatHappensNext: "Native IPv4 packet arrives at PE-2 for direct local delivery.",
      realWorldUse: "Standard default behavior on Cisco, Juniper, and Arista MPLS routers.",
    },
    advanced: {
      whatHappened: "Penultimate Hop Popping (PHP) via LDP Implicit Null Label 3 (RFC 3036 / RFC 5036).",
      whyItHappened:
        "Egress PE-2 advertised reserved Label 3 (Implicit Null) to upstream peer P-2, instructing it to pop the top label and send native IPv4.",
      protocolRule: "RFC 5036 Section 3.4.1: Implicit Null (Label 3) triggers penultimate label stripping.",
      fieldsChanged: ["Outer Label: Popped", "EtherType: 0x0800 (IPv4)", "Egress Lookups: 1 (FIB only)"],
      whatHappensNext: "PE-2 executes a single CEF FIB lookup and delivers packet to customer CE-2.",
      realWorldUse: "Maximizes egress PE ASIC throughput and minimizes latency.",
    },
  },
  {
    eventType: "MPLS_L3VPN_STACK",
    beginner: {
      whatHappened: "Two-Label Stacking: Outer label transports across the ISP, inner label identifies the customer VPN.",
      whyItHappened:
        "Allows multiple competing companies to share the exact same IP addresses without their traffic ever mixing or colliding.",
      protocolRule: "Top label handles ISP core transit; bottom label maps to customer VRF.",
      fieldsChanged: ["Top Label: 101 (S=0)", "Bottom Label: 501 (S=1)", "Stack Depth: 2"],
      whatHappensNext: "Core routers switch top label while inner VPN label remains secure and untouched.",
      realWorldUse: "Powers enterprise global WAN connectivity (AT&T, Verizon, Lumen, Orange Business).",
    },
    advanced: {
      whatHappened: "BGP/MPLS IP VPN (RFC 4364 / 2547bis) Two-Label Hierarchy and VRF Isolation.",
      whyItHappened:
        "PE-1 imposes a hierarchical 2-label stack: Top Label (LDP Transport, S=0) + Bottom Label (MP-BGP VPN, S=1) bound to customer Route Distinguisher (RD) / Route Target (RT).",
      protocolRule: "RFC 4364 Section 3.1: Hierarchical label stacking for multi-tenant VPNs.",
      fieldsChanged: ["Outer Label: 101 (S=0)", "Inner Label: 501 (S=1)", "Target VRF: VRF_RED"],
      whatHappensNext: "Core LSRs switch top transport label without storing customer IP routes (BGP-Free Core).",
      realWorldUse: "Enterprise multi-tenant cloud and corporate WAN virtual private networks.",
    },
  },
  {
    eventType: "MPLS_FRR_DETOUR",
    beginner: {
      whatHappened: "Fast Reroute (FRR): 50-millisecond automatic bypass detour around a broken cable.",
      whyItHappened:
        "When a fiber optic cable is cut, FRR instantly redirects traffic through a pre-computed backup path without dropping calls or video streams.",
      protocolRule: "Pre-programmed backup bypass tunnels activate in under 50 milliseconds.",
      fieldsChanged: ["Bypass Label: 901 (PUSH)", "Detour: P-3 Backup", "Failover Time: <50ms"],
      whatHappensNext: "Traffic detours via backup router P-3 and merges seamlessly back onto the main path at P-2.",
      realWorldUse: "Mission-critical 99.999% SLA carrier backbones for financial exchanges and cellular towers.",
    },
    advanced: {
      whatHappened: "MPLS-TE Fast Reroute (RFC 4090) Facility Backup Bypass Protection.",
      whyItHappened:
        "Point of Local Repair (PLR, PE-1) detects physical link down via BFD (<10ms) and pushes a pre-instantiated Bypass Tunnel Label (901) to route traffic around the failure.",
      protocolRule: "RFC 4090 Section 3.2: Facility backup detour protection with bypass label stacking.",
      fieldsChanged: ["Bypass Label: 901 (S=0)", "Primary Label: 101 (S=1)", "Merge Point: P-2"],
      whatHappensNext: "Backup LSR P-3 switches bypass label to Merge Point P-2, where bypass header is popped.",
      realWorldUse: "Sub-50ms carrier-grade voice, video, and high-frequency trading resilience.",
    },
  },
  {
    eventType: "MPLS_TTL_UNIFORM_PIPE",
    beginner: {
      whatHappened: "TTL Propagation: Uniform Mode reveals core routers; Pipe Mode keeps the ISP core private.",
      whyItHappened:
        "In Pipe Mode, the ISP encapsulates customer packets so customer traceroutes see the entire ISP as a single 1-hop virtual cable.",
      protocolRule: "Pipe Mode hides provider internal routers from customer traceroute.",
      fieldsChanged: ["MPLS TTL: Encapsulated", "Apparent Hops: 1 Hop"],
      whatHappensNext: "Packet is delivered with customer IP TTL preserved.",
      realWorldUse: "Standard security and privacy practice for commercial ISP VPN services.",
    },
    advanced: {
      whatHappened: "RFC 3443 TTL Processing: Uniform vs Pipe vs Short-Pipe Models.",
      whyItHappened:
        "Uniform mode synchronizes decrements between IP TTL and MPLS TTL. Pipe mode maintains independent MPLS TTL (255) and decrements customer IP TTL only once across the entire MPLS domain.",
      protocolRule: "RFC 3443 Section 3.2: Pipe model isolates customer traceroute from provider core topology.",
      fieldsChanged: ["Ingress MPLS TTL: 255 (Pipe)", "Egress IP TTL: Preserved (29)"],
      whatHappensNext: "Customer traceroute probe completes with core hops hidden.",
      realWorldUse: "Service provider core network topology obfuscation and security.",
    },
  },
];
