import type { LearningTopic } from "@/data/learning-content";

export const fusionRouterTopic: LearningTopic = {
  id: "fusion-router",
  title: "Fusion Router",
  subtitle: "Multi-VRF boundary router bridging campus networks, data center fabrics, and WAN edges",
  category: "routing",
  readTime: "8 min",
  summary:
    "A Fusion Router (or VRF Fusion Router) is a Layer 3 routing node positioned at the boundary between distinct network domains — such as an enterprise campus, a data center fabric (e.g. Cisco ACI or EVPN-VXLAN), and a WAN core. It uses Virtual Routing and Forwarding (VRF) to leak routes and bridge isolated tenant networks securely.",
  keyTakeaways: [
    "Operates at the boundary between campus SD-Access, data center fabrics, and WAN edges.",
    "Uses VRF (Virtual Routing and Forwarding) to maintain separate routing tables per tenant.",
    "Performs VRF Route Leaking and route redistribution between dynamic protocols (BGP, OSPF).",
    "Provides central firewall insertion points for inter-VRF security inspection.",
    "Eliminates the need for duplicate physical routers per tenant domain.",
  ],
  diagram: {
    title: "Fusion Router VRF Boundary & Route Leaking Architecture",
    textRepresentation: `Boundary Network Topology:
[ Enterprise Campus / SD-Access ] ──┐
                                     ├──► [ FUSION ROUTER ] ──► [ Firewall / Internet Edge ]
[ Data Center EVPN Fabric ] ─────────┘    (VRF Leaking & MP-BGP)
 (VRF Corp | VRF Guest)                     (VRF Corp ◄─► VRF Guest)`,
  },
  importantTerms: [
    { term: "VRF (Virtual Routing & Forwarding)", definition: "Technology allowing a single physical router to run multiple isolated, independent virtual routing tables simultaneously." },
    { term: "VRF Leaking", definition: "Controlled administrative process of sharing specific IP routes between two otherwise isolated VRFs." },
    { term: "Border Router", definition: "A router located at the edge of a network domain (e.g. Data Center Leaf or Campus Border)." },
    { term: "MP-BGP (Multiprotocol BGP)", definition: "BGP extension carrying BGP EVPN and VRF route target attributes across network backbones." },
    { term: "Route Redistribution", definition: "Importing routes learned by one routing protocol (e.g. OSPF) into another routing protocol (e.g. BGP)." },
  ],
  sections: [
    {
      id: "why-fusion-router-needed",
      title: "Why Fusion Routers Are Needed",
      body: "Modern data centers and enterprise campuses use virtual networks (VLANs/VRFs) to isolate HR, Finance, and Guest users. However, these isolated networks eventually need to reach shared services (like Active Directory, DNS, or the Internet). A Fusion Router bridges these isolated VRFs under strict administrative control.",
    },
    {
      id: "how-fusion-router-works",
      title: "How a Fusion Router Works",
      body: "A Fusion Router functions as a controlled multi-tenant gateway:",
      bullets: [
        "1. Multi-VRF Configuration: Router interfaces are assigned to specific VRFs (e.g. sub-interface G0/0.10 in VRF-Corporate, G0/0.20 in VRF-Guest).",
        "2. BGP/OSPF Peering: Establishes separate routing protocol sessions into the Data Center fabric for each VRF.",
        "3. Route Leaking / Policy Filtering: Uses Route Targets or BGP export rules to leak specific shared service routes (e.g. DNS 10.0.0.53) into tenant VRFs.",
        "4. Firewall Integration: Routes inter-VRF traffic through an external firewall for security inspection before forwarding.",
      ],
    },
    {
      id: "fusion-in-sd-access",
      title: "Fusion Routers in Cisco SD-Access & Data Center Fabrics",
      body: "In Cisco SD-Access and ACI architectures, the Fusion Router connects Fabric Border Nodes to external legacy networks, corporate WANs, or internet firewalls while preserving Virtual Network (VN) separation.",
    },
  ],
  advantages: [
    "Consolidates multi-tenant routing onto a single hardware chassis using VRF logic.",
    "Enables granular controlled route sharing between isolated network domains.",
    "Provides clean enforcement points for perimeter firewalls and security policies.",
  ],
  disadvantages: [
    "High configuration complexity requiring advanced BGP and VRF engineering skills.",
    "Misconfigured route leaking can accidentally bridge secure networks, causing security leaks.",
  ],
  commonUseCases: [
    "Connecting Cisco ACI or EVPN-VXLAN data center fabrics to corporate WAN routers.",
    "Leaking shared DNS and Active Directory services to isolated department VRFs.",
  ],
  commonMistakes: [
    "Accidentally creating routing loops during mutual route redistribution between BGP and OSPF on Fusion Routers.",
    "Leaking entire routing tables between tenant VRFs instead of restricting leaks to specific /32 or /24 shared service prefixes.",
  ],
  comparison: {
    headers: ["Aspect", "Fusion Router", "Standard Layer 3 Router"],
    rows: [
      { label: "Routing Tables", classful: "Multiple isolated VRF tables (VRF Corp, VRF Guest)", cidr: "Single global routing table" },
      { label: "Inter-Domain Traffic", classful: "Controlled VRF route leaking & firewall hair-pinning", cidr: "Direct open IP forwarding" },
      { label: "Target Environment", classful: "Data Center fabrics, SD-Access, Multi-Tenant clouds", cidr: "Standard office LANs & WAN branches" },
    ],
  },
  beginnerSummary:
    "A Fusion Router is an intelligent translator router at the border of a data center or company campus. It keeps different departments (like HR, Accounting, and Guests) safely isolated in their own virtual networks, while selectively allowing them to reach shared tools like DNS or the Internet.",
  relatedLinks: [
    { label: "Router", href: "/learn/router" },
    { label: "Routes", href: "/learn/routes" },
    { label: "BGP", href: "/learn/bgp" },
    { label: "Data Center", href: "/learn/data-center" },
  ],
};
