import type { LearningTopic } from "@/data/learning-content";

export const wifiTopic: LearningTopic = {
  id: "wifi",
  title: "Wi-Fi",
  subtitle: "Wireless Local Area Networking standard (IEEE 802.11)",
  category: "fundamentals",
  readTime: "7 min",
  summary:
    "Wi-Fi is a wireless networking technology governed by IEEE 802.11 standards that allows devices such as laptops, smartphones, and tablets to connect to a local area network (LAN) over radio waves instead of physical cables.",
  keyTakeaways: [
    "Wi-Fi operates at Layer 1 (Physical) and Layer 2 (Data Link) using radio signals.",
    "Devices connect wirelessly to a Wireless Access Point (WAP) identified by an SSID.",
    "Wi-Fi operates primarily across 2.4 GHz, 5 GHz, and 6 GHz frequency bands.",
    "Authentication and encryption (WPA2 / WPA3) secure radio transmissions from eavesdropping.",
    "Wi-Fi provides local network access; it is NOT the same thing as the Internet.",
  ],
  diagram: {
    title: "Simple Wi-Fi Connectivity Flow",
    textRepresentation: `Laptop (Wireless NIC)
       │ (Radio Waves / 802.11)
       ▼
Wireless Access Point (WAP)
       │ (Ethernet Cable / 802.3)
       ▼
 Router ──► Internet`,
  },
  importantTerms: [
    { term: "SSID (Service Set Identifier)", definition: "The public technical name of a wireless network broadcast by an Access Point." },
    { term: "WAP (Wireless Access Point)", definition: "A hardware device that bridges wireless 802.11 radio signals onto a wired Ethernet network." },
    { term: "Frequency Band", definition: "Specific range of radio frequencies used for transmission (2.4 GHz, 5 GHz, 6 GHz)." },
    { term: "Channel", definition: "A smaller subdivision within a frequency band designed to prevent signal overlap and interference." },
    { term: "WPA3", definition: "The latest Wi-Fi Protected Access security standard offering robust cryptographic encryption." },
    { term: "BSSID", definition: "The MAC address of a specific Access Point radio serving a wireless network." },
  ],
  sections: [
    {
      id: "why-wifi-needed",
      title: "Why Wi-Fi is Needed",
      body: "Mobile devices like smartphones, tablets, and laptops cannot be permanently tethered to physical Ethernet cables. Wi-Fi provides freedom of movement within home, enterprise, and public environments while maintaining access to local network resources and the Internet.",
    },
    {
      id: "how-wifi-works",
      title: "How Wi-Fi Works: Authentication & Association",
      body: "Before a wireless client can send data, it undergoes a structured 3-stage process with the Wireless Access Point:",
      bullets: [
        "1. Discovery (Scanning): The client scans for beacon frames broadcast by WAPs to discover available SSIDs.",
        "2. Authentication: The client and WAP exchange 802.11 authentication frames or complete a WPA2/WPA3 key handshake.",
        "3. Association: The WAP accepts the client into its wireless network cell and assigns a logical association ID.",
      ],
    },
    {
      id: "frequency-bands",
      title: "Wi-Fi Frequency Bands Comparison",
      body: "Modern Wi-Fi operates across three main radio spectrum bands:",
      bullets: [
        "2.4 GHz Band: Longer range and better wall penetration, but lower speed and high interference from microwave ovens and Bluetooth.",
        "5 GHz Band: Faster data speeds and less congestion, but shorter signal range and weaker wall penetration.",
        "6 GHz Band (Wi-Fi 6E / Wi-Fi 7): Ultra-high speed with clean spectrum and non-overlapping channels, but shortest signal range.",
      ],
    },
    {
      id: "wifi-standards",
      title: "Wi-Fi Standards Evolution",
      body: "Wi-Fi standards are named by IEEE 802.11 version numbers and simplified generation labels:",
      bullets: [
        "Wi-Fi 4 (802.11n): Introduced Dual-Band 2.4/5 GHz and MIMO technology.",
        "Wi-Fi 5 (802.11ac): Expanded 5 GHz speeds with wider channel bonding.",
        "Wi-Fi 6 / 6E (802.11ax): Enhanced efficiency in high-density environments using OFDMA.",
        "Wi-Fi 7 (802.11be): Extreme throughput with Multi-Link Operation (MLO).",
      ],
    },
  ],
  advantages: [
    "High user mobility — connect anywhere within radio signal coverage.",
    "Easy onboarding without installing physical cable drops for every new device.",
    "Supports dozens of smart home and mobile devices simultaneously.",
  ],
  disadvantages: [
    "Susceptible to physical obstacles (walls, concrete) and radio frequency interference.",
    "Higher latency and potential packet jitter compared to physical Ethernet cables.",
    "Shared radio medium means bandwidth is divided among connected wireless clients.",
  ],
  commonUseCases: [
    "Connecting mobile phones, laptops, and IoT devices in residential homes.",
    "Providing guest network access in coffee shops, hotels, and airports.",
    "Enterprise wireless coverage across corporate office floors.",
  ],
  commonMistakes: [
    "Equating Wi-Fi with the Internet — Wi-Fi is just the wireless link between your device and your local router; if the router loses its ISP link, Wi-Fi stays up but Internet fails.",
    "Thinking 'no SSID broadcast' makes a network invisible and secure — hidden SSIDs can still be discovered easily with simple packet analyzers.",
    "Using overlapping channels on 2.4 GHz — only channels 1, 6, and 11 should be used on 2.4 GHz to avoid adjacent channel interference.",
  ],
  comparison: {
    headers: ["Aspect", "Wi-Fi", "Cellular (4G/5G)"],
    rows: [
      { label: "Network Scope", classful: "Local Area Network (LAN)", cidr: "Wide Area Network (WAN)" },
      { label: "Infrastructure Owner", classful: "User or local enterprise", cidr: "Telecommunications ISP / Carrier" },
      { label: "Spectrum Usage", classful: "Unlicensed radio spectrum", cidr: "Licensed government radio spectrum" },
      { label: "Typical Range", classful: "30 to 100 meters", cidr: "Several kilometers per cell tower" },
    ],
  },
  beginnerSummary:
    "Wi-Fi is a wireless radio standard that connects your phone, laptop, or smart devices to a local access point without cables. It transmits data using radio signals (2.4 GHz, 5 GHz, or 6 GHz), giving you mobile network access within range of an Access Point.",
  relatedLinks: [
    { label: "Ethernet", href: "/learn/ethernet" },
    { label: "IP Address", href: "/learn/ip-address" },
    { label: "DHCP", href: "/learn/dhcp" },
  ],
};
