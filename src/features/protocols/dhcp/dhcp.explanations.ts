import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export interface DhcpExplanation {
  title: string;
  summary: string;
  rfcReference: string;
  technicalDetails: string[];
  troubleshootingTips: string[];
}

export const DHCP_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "state-change",
    beginner: {
      whatHappened: "DHCP Client initialized or transitioned state (INIT -> SELECTING -> REQUESTING -> BOUND).",
      whyItHappened: "A newly connected device boots without network settings and must discover an IP address automatically.",
      protocolRule: "RFC 2131 Section 3: DHCP client finite state machine governs lease acquisition and renewal.",
      fieldsChanged: ["clientState", "leaseTimer"],
      whatHappensNext: "The client will broadcast a DHCPDISCOVER or DHCPREQUEST packet.",
      misconception: "DHCP is not just about IP addresses; it also configures subnet mask, default gateway, and DNS servers.",
      realWorldUse: "Enables plug-and-play connectivity for PCs, phones, and IoT devices on corporate and home Wi-Fi networks.",
    },
    advanced: {
      whatHappened: "Client state machine transition recorded with T1 (50%) and T2 (87.5%) timer scheduling.",
      whyItHappened: "Timer expiration or arrival of DHCPOFFER/DHCPACK frames.",
      protocolRule: "RFC 2131 Section 4.4.5: Timers T1 and T2 control unicast renewal and broadcast rebinding.",
      fieldsChanged: ["client.state", "t1_timer", "t2_timer", "lease.expires"],
      whatHappensNext: "Client performs gratuitous ARP conflict check before committing address binding.",
      misconception: "Clients do not keep the same IP forever without renewing; at 50% lease time they must unicast renew.",
      realWorldUse: "Critical for mobile device roaming and efficient address scope reclamation.",
    },
  },
  {
    eventType: "packet-sent",
    beginner: {
      whatHappened: "A DHCP message (DISCOVER, OFFER, REQUEST, or ACK) was transmitted.",
      whyItHappened: "The 4-step DORA handshake exchanges addressing parameters between client and server.",
      protocolRule: "DHCP uses UDP port 67 (Server) and port 68 (Client) with broadcast destination 255.255.255.255.",
      fieldsChanged: ["packetQueue", "txPackets"],
      whatHappensNext: "The receiving node processes the options and returns the next DORA stage.",
      misconception: "DHCP requests are broadcast so all servers can see which offer was accepted and reclaim other offers.",
      realWorldUse: "Standard automated IP configuration across all global enterprise LANs.",
    },
    advanced: {
      whatHappened: "DHCP frame containing RFC 2132 options transmitted across L2 broadcast domain.",
      whyItHappened: "Client requesting or server offering network configuration parameters.",
      protocolRule: "RFC 2132: Option 53 (Message Type), Option 1 (Mask), Option 3 (Router), Option 6 (DNS).",
      fieldsChanged: ["pdu.xid", "pdu.yiaddr", "pdu.options"],
      whatHappensNext: "Server updates binding table; client applies IP to network interface.",
      misconception: "DHCP Relay Agents (Option 82) insert giaddr to bridge broadcasts across routed boundaries.",
      realWorldUse: "IP Helper addresses on core switches route DHCP requests to centralized data center servers.",
    },
  },
];

export function getDhcpEventExplanation(
  eventType: string,
  messageType?: string,
  mode: "simple" | "advanced" = "simple"
): DhcpExplanation {
  const isAdvanced = mode === "advanced";
  if (messageType === "DHCPDISCOVER") {
    return {
      title: "DHCPDISCOVER (Client Broadcast)",
      summary: isAdvanced
        ? "The client initializes without an assigned IP, transmitting an all-ones broadcast with DHCP Option 53 = 1."
        : "The client boots with no IP address and sends a broadcast message onto the local Ethernet segment to discover available DHCP servers.",
      rfcReference: "RFC 2131 §3.1 (Client-Server Protocol)",
      technicalDetails: [
        "Source IP: 0.0.0.0 (Unspecified address before configuration)",
        "Destination IP: 255.255.255.255 (Limited Broadcast)",
        "Source UDP Port: 68 (DHCP Client)",
        "Destination UDP Port: 67 (DHCP Server)",
        "CHADDR contains client's 48-bit Ethernet MAC address.",
        "XID (Transaction ID) ensures matching of request and response frames.",
      ],
      troubleshootingTips: [
        "If DISCOVER gets no response, verify IP Helper Address / DHCP Relay on router.",
        "Check if VLAN or switch port security blocks broadcast packets.",
      ],
    };
  }

  if (messageType === "DHCPOFFER") {
    return {
      title: "DHCPOFFER (Server Proposal)",
      summary: "One or more DHCP servers respond offering an unassigned IP from their pool, along with subnet mask, gateway, DNS servers, and lease duration.",
      rfcReference: "RFC 2131 §3.1 & RFC 2132 (DHCP Options)",
      technicalDetails: [
        "YIADDR (Your IP Address): The IP address reserved for the client.",
        "Option 51: Lease Time (e.g. 86400s / 24 hours).",
        "Option 1: Subnet Mask (e.g. 255.255.255.0).",
        "Option 3: Router / Default Gateway IP.",
        "Option 6: Domain Name Server list (e.g. 1.1.1.1, 8.8.8.8).",
        "Option 54: Server Identifier IP to distinguish multiple offers.",
      ],
      troubleshootingTips: [
        "If multiple offers arrive, client normally picks the first offer received.",
        "Ensure pool has available unleased addresses.",
      ],
    };
  }

  if (messageType === "DHCPREQUEST") {
    return {
      title: "DHCPREQUEST (Offer Selection & Commitment Request)",
      summary: "The client broadcasts a DHCPREQUEST explicitly selecting one server's offer, while implicitly notifying all other servers that their offers were declined.",
      rfcReference: "RFC 2131 §3.1",
      technicalDetails: [
        "Sent as a Broadcast so all participating DHCP servers receive the choice.",
        "Option 50 (Requested IP Address) specifies the chosen offered IP.",
        "Option 54 (Server Identifier) identifies the chosen DHCP server.",
        "Servers whose offers were not selected return their reserved IPs back to free pool.",
      ],
      troubleshootingTips: [
        "A client also uses unicast DHCPREQUEST to renew existing leases at T1/T2.",
      ],
    };
  }

  if (messageType === "DHCPACK") {
    return {
      title: "DHCPACK (Lease Acknowledgment & Activation)",
      summary: "The selected DHCP server acknowledges the request, commits the lease to its database, and confirms the client can now use the IP address.",
      rfcReference: "RFC 2131 §3.1",
      technicalDetails: [
        "Finalizes lease binding in server's lease database.",
        "Client moves to BOUND state, configures interface, and starts T1 (50%) and T2 (87.5%) timers.",
        "Client performs Gratuitous ARP / ARP probe before using IP to detect conflicts.",
      ],
      troubleshootingTips: [
        "If ARP conflict occurs after ACK, client sends DHCPDECLINE and restarts.",
      ],
    };
  }

  if (messageType === "DHCPNAK") {
    return {
      title: "DHCPNAK (Negative Acknowledgment)",
      summary: "The server rejects the client's request because the requested IP is invalid for the subnet or has already been leased to another host.",
      rfcReference: "RFC 2131 §3.1",
      technicalDetails: [
        "Client immediately discards configuration and restarts in INIT state.",
        "Occurs when roaming across different subnets or lease expired on server.",
      ],
      troubleshootingTips: [
        "Flush client DHCP cache (`ipconfig /renew` or restart interface).",
      ],
    };
  }

  if (messageType === "DHCPDECLINE") {
    return {
      title: "DHCPDECLINE (Address Conflict Detected)",
      summary: "The client discovered an IP address conflict via ARP probe and refused the offered lease, prompting the server to quarantine the conflicted IP.",
      rfcReference: "RFC 2131 §3.1",
      technicalDetails: [
        "Client sends DHCPDECLINE to server with Option 54 server identifier.",
        "Server marks IP as conflicted/declined to prevent assigning to other clients.",
        "Client restarts discovery in INIT state.",
      ],
      troubleshootingTips: [
        "Check for statically configured devices overlapping with DHCP pool.",
      ],
    };
  }

  return {
    title: "DHCP Event",
    summary: "Dynamic Host Configuration Protocol state machine update.",
    rfcReference: "RFC 2131",
    technicalDetails: ["Client-server UDP handshake process."],
    troubleshootingTips: ["Check physical link and switch port configuration."],
  };
}
