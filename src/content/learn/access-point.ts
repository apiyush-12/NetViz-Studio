import type { LearningTopic } from "@/data/learning-content";

export const accessPointTopic: LearningTopic = {
  id: "access-point",
  title: "Access Point",
  subtitle: "Wireless Access Point (WAP) — Layer 2 radio transceiver bridging 802.11 wireless clients to wired Ethernet networks",
  category: "fundamentals",
  readTime: "7 min",
  summary:
    "A Wireless Access Point (WAP or AP) is a physical Layer 2 networking device that transmits and receives radio frequency (RF) signals using IEEE 802.11 Wi-Fi standards. It bridges wireless clients (laptops, smartphones) onto a wired Ethernet local area network (LAN).",
  keyTakeaways: [
    "Bridges Layer 2 wireless 802.11 radio frames to wired 802.3 Ethernet frames.",
    "Broadcasts SSIDs across 2.4 GHz, 5 GHz, and 6 GHz frequency bands.",
    "Can operate as Standalone (Fat AP) or Controller-Managed (Thin AP via CAPWAP).",
    "Powered via Power over Ethernet (PoE / PoE+ / PoE++) over standard Cat6 cables.",
    "Enables seamless wireless roaming as clients move between overlapping AP coverage cells.",
  ],
  diagram: {
    title: "Access Point Hardware Bridging & Controller Architecture",
    textRepresentation: `Access Point Bridging Flow:
Wireless Clients (802.11 Radio)              Wired Network (802.3 Ethernet)
[ Smartphone ] ──┐
[ Laptop     ] ──┼── (Radio Waves) ──► [ Access Point ] ──(PoE Ethernet)──► [ Switch ]
[ Tablet     ] ──┘                          (Translates 802.11 ◄─► 802.3)      │
                                                                                ▼
                                                                        [ WLC Controller ]`,
  },
  importantTerms: [
    { term: "WAP (Wireless Access Point)", definition: "Dedicated hardware transceiver creating a wireless local area network cell." },
    { term: "BSSID (Basic Service Set Identifier)", definition: "The physical MAC address of a specific radio interface on an Access Point." },
    { term: "Thin AP (Lightweight AP)", definition: "An Access Point that offloads management, authentication, and channel selection to a central Wireless LAN Controller (WLC)." },
    { term: "Fat AP (Autonomous AP)", definition: "A self-contained Access Point individually configured and managed without a central controller." },
    { term: "CAPWAP", definition: "Control and Provisioning of Wireless Access Points protocol used by controllers to manage Lightweight APs over IP." },
    { term: "PoE (Power over Ethernet)", definition: "IEEE 802.3af/at standard delivering electrical power and network data over a single Cat6 copper cable." },
  ],
  sections: [
    {
      id: "why-access-point-needed",
      title: "Why Access Points Are Needed",
      body: "While home routers combine a router, switch, and Wi-Fi radio in one box, enterprise buildings require dozens of dedicated Wireless Access Points mounted across ceilings to provide seamless Wi-Fi coverage across thousands of square feet.",
    },
    {
      id: "how-access-point-works",
      title: "How an Access Point Bridges Traffic",
      body: "An Access Point translates between two distinct Layer 2 frame formats:",
      bullets: [
        "1. Wireless Reception: AP receives an 802.11 radio frame from a laptop.",
        "2. Header Translation: AP converts the 802.11 wireless frame header into an 802.3 Ethernet frame header.",
        "3. Wired Transmission: AP transmits the Ethernet frame over its PoE cable connection to a local switch port.",
        "4. Roaming Management: Assists client devices in handing off connection to adjacent APs as users walk down hallways.",
      ],
    },
    {
      id: "standalone-vs-controller",
      title: "Standalone vs Controller-Managed APs",
      body: "Comparing enterprise deployment models:",
      bullets: [
        "Autonomous (Fat AP): Configured manually line-by-line. Suitable for small offices with 1 to 3 APs.",
        "Controller-Based (Thin AP): Automatically downloads configuration, firmware, dynamic RF channel management, and security policies from a central Wireless LAN Controller (WLC).",
      ],
    },
  ],
  advantages: [
    "Extends local network connectivity wirelessly across large physical spaces.",
    "Powered conveniently over standard Ethernet cables using PoE (no local AC outlet needed).",
    "Supports enterprise security standards (WPA3-Enterprise / 802.1X RADIUS authentication).",
  ],
  disadvantages: [
    "Susceptible to physical signal attenuation from walls, metal, and water pipes.",
    "Improper channel deployment causes co-channel interference and degraded Wi-Fi performance.",
  ],
  commonUseCases: [
    "Ceiling-mounted enterprise Wi-Fi coverage in corporate office floors, university campuses, and hospitals.",
    "High-density wireless connectivity in sports stadiums and convention centers.",
  ],
  commonMistakes: [
    "Confusing a Wireless Access Point with a Gateway Router — an AP only provides wireless Layer 2 access; it does not perform IP routing or NAT.",
    "Installing APs on overlapping radio channels on 2.4 GHz (should strictly use non-overlapping channels 1, 6, and 11).",
  ],
  comparison: {
    headers: ["Aspect", "Wireless Access Point (AP)", "Home Wi-Fi Router"],
    rows: [
      { label: "Function", classful: "Pure Layer 2 wireless-to-wired bridge", cidr: "All-in-one device (Router + Switch + AP + NAT Firewall)" },
      { label: "Management", classful: "Centralized via Wireless LAN Controller (WLC)", cidr: "Individual web GUI dashboard" },
      { label: "Power Source", classful: "Power over Ethernet (PoE via network cable)", cidr: "External AC wall power adapter" },
      { label: "Deployment Scope", classful: "Multi-AP enterprise campuses (Dozens/Hundreds)", cidr: "Single residential home or small apartment" },
    ],
  },
  beginnerSummary:
    "A Wireless Access Point (AP) is a radio transceiver box mounted on office ceilings. It acts as a bridge, converting radio signals from your phone or laptop into wired Ethernet signals that travel down network cables to a switch.",
  relatedLinks: [
    { label: "Wi-Fi", href: "/learn/wifi" },
    { label: "Ethernet", href: "/learn/ethernet" },
    { label: "Switch", href: "/learn/switch" },
    { label: "DNA Center", href: "/learn/dna-center" },
  ],
};
