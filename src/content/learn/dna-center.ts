import type { LearningTopic } from "@/data/learning-content";

export const dnaCenterTopic: LearningTopic = {
  id: "dna-center",
  title: "DNA Center",
  subtitle: "Cisco DNA Center (Catalyst Center) — Centralized network management, Intent-Based automation, policy, and analytics controller",
  category: "services",
  readTime: "8 min",
  summary:
    "Cisco DNA Center (now Cisco Catalyst Center) is a powerful centralized network management, automation, and assurance controller for enterprise networks. It implements Intent-Based Networking (IBN), allowing network engineers to translate business intent into automated configurations across switches, routers, and wireless controllers.",
  keyTakeaways: [
    "Serves as the central command console for Cisco SD-Access and enterprise Catalyst networks.",
    "Implements Intent-Based Networking (IBN) across Design, Provision, Policy, and Assurance pillars.",
    "Automates network device onboarding via Plug and Play (PnP) zero-touch software deployments.",
    "Provides AI-driven Network Assurance to proactively detect and troubleshoot network faults.",
    "Uses Group-Based Policies (Scalable Group Tags - SGTs) for zero-trust micro-segmentation.",
  ],
  diagram: {
    title: "DNA Center (Catalyst Center) Intent-Based Architecture",
    textRepresentation: `Cisco DNA Center (Central Controller Hub)
┌────────────────────────────────────────────────────────────────────────┐
│  Design  │  Provision  │  Policy (SGT Security)  │  Assurance (AI)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (REST APIs / NETCONF / Telemetry)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Enterprise Infrastructure Fabric (Switches, Routers, Wireless APs)     │
└────────────────────────────────────────────────────────────────────────┘`,
  },
  importantTerms: [
    { term: "Intent-Based Networking (IBN)", definition: "Network architecture where high-level business goals are automatically translated into device CLI configurations." },
    { term: "Assurance", definition: "AI/ML analytics engine in DNA Center monitoring streaming telemetry to predict and isolate network issues." },
    { term: "SD-Access (Software-Defined Access)", definition: "Cisco enterprise fabric architecture automating user authentication, segmentation, and policy enforcement." },
    { term: "Scalable Group Tag (SGT)", definition: "A 16-bit tag assigned to users/devices allowing role-based access control regardless of IP address." },
    { term: "Plug and Play (PnP)", definition: "Zero-touch onboarding agent allowing new switches to auto-configure upon connection to the network." },
  ],
  sections: [
    {
      id: "why-dna-center-needed",
      title: "Why Cisco DNA Center is Needed",
      body: "Managing hundreds of enterprise switches, routers, and access points manually via SSH CLI commands leads to human errors, inconsistent ACL policies, and slow troubleshooting. DNA Center replaces manual CLI management with a centralized, automated API-driven controller.",
    },
    {
      id: "four-pillars-of-dna-center",
      title: "The Four Pillars of Cisco DNA Center",
      body: "DNA Center organizes network management into four core workflows:",
      bullets: [
        "1. Design: Define global network hierarchies, building floor maps, IP address pools, and device software image baselines.",
        "2. Provision: Automatically push configurations, software upgrades, and licenses to hundreds of network devices in bulk.",
        "3. Policy: Create group-based security policies (SGTs) that restrict access between user groups (e.g. Contractors vs HR).",
        "4. Assurance: Real-time telemetry monitoring providing health scores (0-100) for devices, clients, and applications.",
      ],
    },
    {
      id: "cli-vs-controller",
      title: "Traditional CLI vs Controller-Based Management",
      body: "DNA Center transitions enterprise networking from box-by-box configuration to fabric-wide orchestration.",
    },
  ],
  advantages: [
    "Dramatically reduces network deployment and maintenance operational costs (OpEx).",
    "AI-driven proactive network troubleshooting pinpoints Wi-Fi and cable issues instantly.",
    "Consistent zero-trust policy enforcement across wired and wireless networks.",
    "Open REST APIs enable integration with ITSM platforms like ServiceNow.",
  ],
  disadvantages: [
    "Requires substantial hardware appliance investment and software licensing.",
    "Primarily optimized for Cisco enterprise hardware environments.",
  ],
  commonUseCases: [
    "Automating software upgrades and security patches across thousands of enterprise campus switches.",
    "Proactively troubleshooting employee Wi-Fi connectivity and RADIUS authentication drops.",
  ],
  commonMistakes: [
    "Treating DNA Center merely as a passive monitoring tool instead of leveraging its automated provisioning and policy engines.",
    "Neglecting initial IP address pool and building hierarchy design before onboarding devices.",
  ],
  comparison: {
    headers: ["Aspect", "Cisco DNA Center (Controller)", "Traditional Network Management (CLI)"],
    rows: [
      { label: "Configuration Method", classful: "Centralized GUI / REST APIs / Intent Policy", cidr: "Manual SSH / Telnet CLI commands per box" },
      { label: "Troubleshooting", classful: "AI Assurance telemetry & historical packet capture", cidr: "Manual show commands & syslog analysis" },
      { label: "Security Policy", classful: "Role-Based Scalable Group Tags (SGTs)", cidr: "IP-based static Access Control Lists (ACLs)" },
      { label: "Device Onboarding", classful: "Automated Plug and Play (PnP zero-touch)", cidr: "Manual console cable staging" },
    ],
  },
  beginnerSummary:
    "Cisco DNA Center (Catalyst Center) is a central brain for big corporate networks. Instead of an engineer typing lines of code into 500 individual network switches one by one, DNA Center lets them control, update, and secure the entire network from a single smart dashboard.",
  relatedLinks: [
    { label: "Access Point", href: "/learn/access-point" },
    { label: "Switch", href: "/learn/switch" },
    { label: "SD-WAN", href: "/learn/sd-wan" },
    { label: "Firewall", href: "/learn/firewall" },
  ],
};
