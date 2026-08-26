export interface NatExplanation {
  title: string;
  summary: string;
  rfcReference: string;
  technicalDetails: string[];
  troubleshootingTips: string[];
  securityNotes: string[];
}

export const natExplanations: Record<string, NatExplanation> = {
  "packet-originated": {
    title: "Outbound Packet Generated in Private LAN",
    summary: "Internal host initializes a socket connection using an RFC 1918 private IPv4 address (e.g. 192.168.1.10:54321).",
    rfcReference: "RFC 1918 / RFC 791",
    technicalDetails: [
      "Source IP: Private LAN IP (192.168.1.10)",
      "Source Port: Ephemeral client port (e.g. 54321)",
      "Destination IP: Public WAN IP (93.184.216.34)",
      "Destination Port: Web service port (443 / 80)",
      "Private IPv4 addresses cannot be routed across the public internet (dropped by ISP edge routers).",
    ],
    troubleshootingTips: [
      "Ensure client default gateway is set to the NAT router's inside LAN interface (192.168.1.1).",
      "Verify host netmask matches the private LAN subnet (/24).",
    ],
    securityNotes: [
      "Private IP hiding prevents external direct port scans against internal LAN hosts.",
    ],
  },
  "nat-lookup": {
    title: "Stateful NAT Translation Table Search",
    summary: "The NAT Gateway inspects the packet header and checks its active translation state table for a matching tuple.",
    rfcReference: "RFC 3022 Section 3.1",
    technicalDetails: [
      "4-Tuple Lookup: { Inside Local IP, Inside Local Port, Protocol, Outside Global IP }",
      "If a valid state entry exists, the NAT router reuses the assigned Inside Global Port.",
      "If no entry exists, a new dynamic mapping is created in memory.",
      "PAT / NAPT allocates an ephemeral public port from the router's WAN IP pool.",
    ],
    troubleshootingTips: [
      "Check router memory and maximum NAT session limit if high-traffic networks freeze.",
      "Adjust UDP/TCP idle timeout values (default 300s for TCP, 30s for UDP).",
    ],
    securityNotes: [
      "Stateful NAT provides implicit inbound firewall filtering (unsolicited WAN packets are dropped).",
    ],
  },
  "header-rewritten": {
    title: "IP Header Rewriting & Checksum Recalculation",
    summary: "The NAT Gateway modifies packet headers in-place and updates the IP and TCP/UDP checksums.",
    rfcReference: "RFC 3022 / RFC 1624",
    technicalDetails: [
      "Outbound Translation: Replaces Source IP (192.168.1.10 -> 203.0.113.1) and Source Port (54321 -> 40001).",
      "Inbound Translation: Replaces Destination IP (203.0.113.1 -> 192.168.1.10) and Destination Port (40001 -> 54321).",
      "Checksum Recalculation: Incremental 16-bit one's complement addition per RFC 1624.",
      "Application Payload Modification: Protocols embedding IP addresses (e.g. FTP PORT, SIP, H.323) require Application Layer Gateway (ALG).",
    ],
    troubleshootingTips: [
      "Disable SIP ALG or H.323 ALG on consumer routers if VoIP calls experience one-way audio.",
      "Verify IP checksum offloading on high-speed network interface cards.",
    ],
    securityNotes: [
      "Header modification breaks end-to-end IPsec AH (Authentication Header) integrity checks; use IPsec ESP with NAT-Traversal (UDP 4500).",
    ],
  },
  "forwarded": {
    title: "Packet Forwarding Across Zone Boundary",
    summary: "The translated packet is forwarded out the destination interface (WAN or LAN).",
    rfcReference: "RFC 1812",
    technicalDetails: [
      "Outbound: Forwarded out WAN interface Serial0/0 toward ISP Gateway 203.0.113.254.",
      "Inbound: Forwarded out LAN interface GigabitEthernet0/1 to destination host 192.168.1.10.",
      "TTL Decremented by 1 at router hop.",
    ],
    troubleshootingTips: [
      "Check WAN interface routing table for default route 0.0.0.0/0.",
    ],
    securityNotes: [
      "Ensure WAN ACLs do not block translated return traffic.",
    ],
  },
  "table-entry-created": {
    title: "Dynamic Translation Table Entry Instantiated",
    summary: "A new stateful binding is registered in the NAT router's translation table with a countdown timer.",
    rfcReference: "RFC 4787 / RFC 5382",
    technicalDetails: [
      "Inside Local: 192.168.1.10:54321",
      "Inside Global: 203.0.113.1:40001",
      "Outside Global: 93.184.216.34:443",
      "State: ACTIVE (Timer initialized to 300 seconds)",
    ],
    troubleshootingTips: [
      "Monitor table usage to prevent port exhaustion under P2P or torrent workloads.",
    ],
    securityNotes: [
      "Endpoints re-use ports safely using Endpoint-Independent or Endpoint-Dependent Mapping rules.",
    ],
  },
};

export function getNatEventExplanation(eventType: string): NatExplanation {
  return (
    natExplanations[eventType] || {
      title: "NAT State Transaction",
      summary: "Network Address Translation process operating per RFC 3022 standards.",
      rfcReference: "RFC 3022",
      technicalDetails: [
        "Header IP/Port modification performed.",
        "Stateful translation table updated.",
      ],
      troubleshootingTips: ["Verify NAT configuration and interface zone assignment."],
      securityNotes: ["Check ACLs and firewall rules."],
    }
  );
}
