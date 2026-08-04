import type { LearningTopic } from "@/data/learning-content";

export const saseTopic: LearningTopic = {
  id: "sase",
  title: "SASE",
  subtitle: "Secure Access Service Edge — Cloud-native architecture converging SD-WAN networking and Security Service Edge (SSE)",
  category: "security",
  readTime: "8 min",
  summary:
    "SASE (Secure Access Service Edge, pronounced 'sassy') is a cloud-delivered architectural framework that converges Software-Defined Wide Area Networking (SD-WAN) with comprehensive Security Service Edge (SSE) functions—including ZTNA, SWG, CASB, and FWaaS—into a single unified service.",
  keyTakeaways: [
    "Converges WAN edge networking (SD-WAN) with cloud-native security services (SSE).",
    "Enforces Zero Trust Network Access (ZTNA) based on user identity, device health, and context.",
    "Inspects traffic at distributed Cloud Edge Points of Presence (PoPs) close to users.",
    "Includes Secure Web Gateway (SWG), Cloud Access Security Broker (CASB), and Firewall-as-a-Service (FWaaS).",
    "Replaces legacy backhauling of remote user traffic to central corporate data center firewalls.",
  ],
  diagram: {
    title: "SASE Converged Cloud Architecture",
    textRepresentation: `Distributed End Users & Branch Offices
[ Remote Employee ] ──┐
[ Branch Office   ] ──┼── (Encrypted SD-WAN Tunnel)
[ Mobile Device   ] ──┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│             SASE Cloud Edge PoP (Single Pass)          │
│  Networking: SD-WAN Dynamic Path Selection             │
│  Security:   ZTNA | SWG (URL Filter) | CASB | FWaaS   │
└───────────────────────┬────────────────────────────────┘
                        │ (Inspected & Authenticated)
                        ▼
           ┌──────────────────────────┐
           │ SaaS (Office 365, Slack) │
           │ Public Cloud (AWS, GCP)  │
           │ Private Data Center      │
           └──────────────────────────┘`,
  },
  importantTerms: [
    { term: "SSE (Security Service Edge)", definition: "The security component subset of SASE encompassing SWG, CASB, ZTNA, and FWaaS." },
    { term: "ZTNA (Zero Trust Network Access)", definition: "Security model granting access to specific applications based on verified identity and context, never defaulting to implicit trust." },
    { term: "SWG (Secure Web Gateway)", definition: "Cloud filter enforcing web safety policies, blocking malware downloads and malicious URLs." },
    { term: "CASB (Cloud Access Security Broker)", definition: "Security policy enforcement point between users and cloud SaaS applications (protecting data loss in cloud apps)." },
    { term: "FWaaS (Firewall-as-a-Service)", definition: "Cloud-hosted stateful and deep-packet-inspection firewall inspecting non-web traffic." },
    { term: "Point of Presence (PoP)", definition: "Geographically distributed cloud edge data centers executing SASE security inspection close to end users." },
  ],
  sections: [
    {
      id: "why-sase-needed",
      title: "Why SASE is Needed",
      body: "In a cloud-first, work-from-anywhere world, employees no longer sit in corporate offices and application data no longer lives strictly in private data centers. Backhauling remote traffic through central corporate firewalls creates massive latency. SASE moves security inspection to the cloud edge where users and apps actually meet.",
    },
    {
      id: "core-components",
      title: "Core Components of SASE",
      body: "SASE converges two distinct technology pillars into a single-pass cloud architecture:",
      bullets: [
        "1. Network Edge (SD-WAN): Dynamic path steering, WAN optimization, and multi-link bonding.",
        "2. Security Edge (SSE): ZTNA (least-privilege app access), SWG (web filtering), CASB (SaaS DLP), and FWaaS (cloud firewalling).",
        "3. Single-Pass Inspection: Decrypts and inspects traffic once for malware, data loss, and policy compliance simultaneously.",
      ],
    },
    {
      id: "ztna-vs-vpn",
      title: "Zero Trust (ZTNA) vs Traditional Corporate VPN",
      body: "How SASE transforms remote access security:",
      bullets: [
        "Traditional VPN: Authenticates a user once and grants them full Layer 3 access to the ENTIRE corporate network subnet.",
        "ZTNA (SASE): Never trusts implicitly. Connects users strictly to SPECIFIC authorized applications (e.g. Jira only), hiding the rest of the corporate network.",
      ],
    },
  ],
  advantages: [
    "Significantly reduces latency for remote workers accessing cloud SaaS applications.",
    "Unified management console for both WAN networking and security policies.",
    "Enforces Zero Trust security — hides internal applications from unauthorized discovery.",
    "Scales seamlessly globally without purchasing physical firewall appliances.",
  ],
  disadvantages: [
    "Requires migrating away from legacy hardware firewall vendors.",
    "Requires high trust in a single cloud SASE vendor's global PoP uptime and infrastructure.",
  ],
  commonUseCases: [
    "Securing hybrid workforces connecting from home, coffee shops, or branch offices to SaaS and cloud apps.",
    "Protecting sensitive cloud data against unauthorized downloads using CASB data loss prevention (DLP).",
  ],
  commonMistakes: [
    "Thinking SASE is a single software product you can buy off the shelf — SASE is an architectural framework converging SD-WAN and SSE.",
    "Confusing ZTNA with traditional VPN — ZTNA restricts access per application rather than granting access to an entire IP subnet.",
  ],
  comparison: {
    headers: ["Aspect", "SASE Architecture", "Traditional Datacenter Hairpinning"],
    rows: [
      { label: "Traffic Path", classful: "Direct to Cloud Edge PoP (Optimal latency)", cidr: "Hairpinned back to central Data Center firewall" },
      { label: "Security Access Model", classful: "Zero Trust (Per-app access based on ZTNA)", cidr: "Implicit Trust (Full subnet access via VPN)" },
      { label: "Management", classful: "Unified cloud dashboard (Networking + Security)", cidr: "Disparate consoles for VPN, Firewalls, and Routers" },
      { label: "Scalability", classful: "Elastic cloud capacity across global PoPs", cidr: "Constrained by physical data center firewall throughput" },
    ],
  },
  beginnerSummary:
    "SASE is modern cloud security for work-from-anywhere teams. Instead of forcing remote workers to connect through a slow company VPN back at headquarters, SASE inspects traffic at nearby cloud security towers, giving users fast and secure access to cloud apps.",
  relatedLinks: [
    { label: "SD-WAN", href: "/learn/sd-wan" },
    { label: "Firewall", href: "/learn/firewall" },
    { label: "VPN", href: "/learn/vpn" },
    { label: "TLS", href: "/learn/tls" },
  ],
};
