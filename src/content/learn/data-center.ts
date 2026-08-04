import type { LearningTopic } from "@/data/learning-content";

export const dataCenterTopic: LearningTopic = {
  id: "data-center",
  title: "Data Center",
  subtitle: "Dedicated physical facility housing enterprise computing servers, storage arrays, and high-speed network fabrics",
  category: "fundamentals",
  readTime: "8 min",
  summary:
    "A Data Center is a physical facility that organizations use to house their critical computing applications, enterprise data servers, storage systems, and high-speed network infrastructure. It provides redundant power, environmental climate controls, physical security, and high-density network connectivity.",
  keyTakeaways: [
    "Dedicated physical facility engineered for 24/7 high-availability IT operations.",
    "Uses modern Spine-and-Leaf (CLOS) network architectures for predictable low-latency server-to-server traffic.",
    "Features dual redundant power supplies (UPS, Diesel Generators) and specialized HVAC cooling.",
    "Houses Top-of-Rack (ToR) switches, blade servers, SAN storage arrays, and perimeter firewalls.",
    "Differs from traditional enterprise office LANs by prioritizing east-west traffic flow.",
  ],
  diagram: {
    title: "Data Center Spine-and-Leaf (CLOS) Network Fabric Topology",
    textRepresentation: `Spine-Leaf Architecture:
                    [ Spine Switch 1 ]       [ Spine Switch 2 ]
                           │   ╲            ╱   │
                           │    ╲          ╱    │
                           │     ╲        ╱     │
                    [ Leaf Switch 1 ]        [ Leaf Switch 2 ]  (Top-of-Rack - ToR)
                       │        │               │        │
                       ▼        ▼               ▼        ▼
                   [ Server ] [ Server ]    [ Server ] [ Server ]`,
  },
  importantTerms: [
    { term: "Spine-and-Leaf Architecture", definition: "A two-tier network fabric where every leaf switch connects to every spine switch, ensuring consistent 1-hop latency between servers." },
    { term: "East-West Traffic", definition: "Network traffic moving laterally between servers inside the data center (e.g. web server to database)." },
    { term: "North-South Traffic", definition: "Network traffic entering or exiting the data center to/from the external Internet or branch offices." },
    { term: "Top-of-Rack (ToR)", definition: "A switch mounted at the top of a server rack connecting all servers within that specific rack." },
    { term: "SAN (Storage Area Network)", definition: "A dedicated high-speed network (Fibre Channel or iSCSI) connecting servers to block storage arrays." },
    { term: "PDU (Power Distribution Unit)", definition: "Industrial power strip installed in racks to deliver managed electrical power to servers." },
  ],
  sections: [
    {
      id: "why-data-center-needed",
      title: "Why Data Centers Are Needed",
      body: "Standard office buildings lack the power density, backup generators, precision cooling, and high-bandwidth fiber connectivity required to host enterprise databases and cloud platforms without downtime. Data centers provide an engineered physical environment.",
    },
    {
      id: "spine-leaf-fabric",
      title: "Modern Spine-and-Leaf Network Fabrics",
      body: "Traditional enterprise networks used 3-tier architectures (Core, Distribution, Access). Modern data centers use Spine-and-Leaf fabrics:",
      bullets: [
        "Consistent Hop Count: Every Leaf switch connects directly to every Spine switch. Server A to Server B is always exactly 2 hops.",
        "Non-Blocking Bandwidth: High-speed interconnects (40G, 100G, 400G) prevent network congestion during large data transfers.",
        "ECMP Routing: Equal-Cost Multi-Path routing utilizes all available links simultaneously without STP port blocking.",
      ],
    },
    {
      id: "physical-infrastructure",
      title: "Physical Infrastructure Components",
      body: "Essential physical subsystems inside a modern data center facility:",
      bullets: [
        "Redundant Power: Dual utility feeds, Uninterruptible Power Supplies (UPS), and backup diesel generators (N+1 or 2N redundancy).",
        "Precision Cooling: Hot-aisle / Cold-aisle containment systems to prevent server overheating.",
        "Physical Security: Biometric scanners, security mantraps, video surveillance, and cage access logs.",
      ],
    },
  ],
  advantages: [
    "99.999% ('five nines') uptime reliability for critical business applications.",
    "Predictable low-latency network performance for server-to-server microservices.",
    "Robust physical security and disaster recovery capabilities.",
  ],
  disadvantages: [
    "Extremely high capital expenditure (CapEx) to build and ongoing operational costs (OpEx) for electricity.",
    "Requires specialized data center network and facility engineering staff.",
  ],
  commonUseCases: [
    "Hosting corporate enterprise ERP systems, databases, and private cloud infrastructure.",
    "Colocation facilities renting rack space and power to multiple business clients.",
  ],
  commonMistakes: [
    "Using traditional Spanning Tree Protocol (STP) in modern data centers — blocks half the available fiber links; Spine-Leaf with ECMP is preferred.",
    "Ignoring hot-aisle/cold-aisle airflow containment, leading to server thermal throttling.",
  ],
  comparison: {
    headers: ["Aspect", "Data Center Network", "Enterprise Office LAN"],
    rows: [
      { label: "Primary Traffic Pattern", classful: "East-West (Server-to-Server microservices)", cidr: "North-South (User workstation to Internet)" },
      { label: "Topology", classful: "2-Tier Spine-and-Leaf (CLOS)", cidr: "3-Tier (Core, Distribution, Access)" },
      { label: "Bandwidth Speed", classful: "10 Gbps to 400 Gbps per server port", cidr: "1 Gbps to 10 Gbps per user port" },
      { label: "Redundancy Level", classful: "N+1 or 2N (Dual UPS, Dual Power Supplies)", cidr: "Basic single UPS per closet" },
    ],
  },
  beginnerSummary:
    "A Data Center is a fortress for computers. It is a specialized building filled with racks of servers, high-speed fiber switches, giant air conditioners, and backup diesel generators designed to keep major websites and company databases running 24/7 without failing.",
  relatedLinks: [
    { label: "Switch", href: "/learn/switch" },
    { label: "Router", href: "/learn/router" },
    { label: "Load Balancer", href: "/learn/load-balancer" },
    { label: "Fusion Router", href: "/learn/fusion-router" },
  ],
};
