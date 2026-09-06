import type { ExplanationSection } from "@/features/protocols/shared/protocol-types";

export const STP_EXPLANATION_SECTIONS: ExplanationSection[] = [
  {
    eventType: "root-election",
    beginner: {
      whatHappened:
        "All switches broadcasted BPDUs declaring themselves as the Root Bridge. The switch with the lowest Bridge ID (Priority + MAC) won the election.",
      whyItHappened:
        "Every Spanning Tree network requires a single reference point (Root Bridge) from which the loop-free tree is built.",
      protocolRule:
        "IEEE 802.1D Clause 8.6: Bridge with lowest Priority (or lowest MAC if priorities are equal) becomes the Root Bridge.",
      fieldsChanged: ["rootBridgeId", "isRoot", "rootPathCost"],
      whatHappensNext:
        "Non-root switches calculate their shortest path (lowest Root Path Cost) towards this elected Root Bridge.",
      misconception:
        "Higher bridge priority makes a switch more preferred. (In STP, lower numerical priority is superior: 0 is highest priority, 61440 is lowest).",
      realWorldUse:
        "Network engineers configure Core switches with Priority 4096 or 8192 (or 0) so traffic always centers around high-capacity backbones.",
    },
    advanced: {
      whatHappened:
        "Bridge ID evaluation: (Priority 4096 + SysID Ext 1) . MAC is compared across all received BPDUs on all active interfaces.",
      whyItHappened:
        "Deterministic Root Bridge placement prevents sub-optimal transit paths and keeps layer-2 convergence predictable.",
      protocolRule:
        "IEEE 802.1t / 802.1D-2004: Bridge ID uses 4-bit Priority (increments of 4096), 12-bit Extended System ID (VLAN ID), and 48-bit base MAC address.",
      fieldsChanged: ["rootBridgeId", "rootPathCost", "messageAge"],
      whatHappensNext:
        "Non-root bridges begin Root Port (RP) and Designated Port (DP) election on all active segments.",
      misconception:
        "Root Bridge election must happen before any ports can listen. (Switches continuously exchange BPDUs; election is dynamic).",
      realWorldUse:
        "Spanning Tree Root Guard is configured on access ports to prevent rogue switches with Priority 0 from hijacking the root role.",
    },
  },
  {
    eventType: "port-role-elected",
    beginner: {
      whatHappened:
        "Ports were classified into Root Ports (RP), Designated Ports (DP), and Alternate/Blocked Ports (AP/BLK).",
      whyItHappened:
        "To prevent loops, every link must have exactly one Designated Port, every non-root switch has one Root Port, and redundant links are blocked.",
      protocolRule:
        "Root Port = lowest path cost to Root. Designated Port = lowest path cost on that link. All remaining ports are Blocked.",
      fieldsChanged: ["port.role", "port.state"],
      whatHappensNext:
        "Blocked ports stop forwarding data frames while Root & Designated ports transition to Forwarding.",
      misconception:
        "Blocked ports are completely dead. (Blocked ports still listen for BPDUs to detect if active links fail).",
      realWorldUse:
        "Provides immediate active/standby link redundancy for enterprise switches without creating broadcast storms.",
    },
    advanced: {
      whatHappened:
        "4-step vector tiebreaker evaluated: 1. Lowest Root Path Cost -> 2. Lowest Sender Bridge ID -> 3. Lowest Sender Port ID (PID) -> 4. Lowest Local Port ID.",
      whyItHappened:
        "Deterministic arbitration resolves equal-cost redundant parallel links between adjacent switches.",
      protocolRule:
        "IEEE 802.1D Clause 8.6.2: Port Identifier is an 8-bit priority + 8-bit port number (e.g. 128.1 for Gi0/1).",
      fieldsChanged: ["port.role", "port.designatedBridgeId", "port.designatedPortId"],
      whatHappensNext:
        "Designated and Root ports move through Listening and Learning timers before reaching Forwarding.",
      misconception:
        "Port cost is based on physical cable length. (Port cost is determined by link bandwidth: 10M=100, 100M=19, 1G=4, 10G=2).",
      realWorldUse:
        "LACP EtherChannel bundles multiple parallel links into one logical link with cost 3 or 2, avoiding blocking altogether.",
    },
  },
  {
    eventType: "port-state-transition",
    beginner: {
      whatHappened:
        "Ports transitioned through Blocking -> Listening (15s) -> Learning (15s) -> Forwarding (30s total delay).",
      whyItHappened:
        "Timers ensure all switches agree on the new topology and learn MAC addresses before passing live data to prevent transient loops.",
      protocolRule:
        "IEEE 802.1D: 2x Forward Delay (15s + 15s = 30s) prevents temporary bridging loops during convergence.",
      fieldsChanged: ["port.state"],
      whatHappensNext:
        "Once in Forwarding state, ports forward standard Ethernet frames and learn source MAC addresses.",
      misconception:
        "Listening and Learning are identical. (Listening discards frames and learns no MACs; Learning populates MAC table without forwarding).",
      realWorldUse:
        "Cisco PortFast / 802.1w Edge Port bypasses Listening/Learning for end-user PCs and servers for instant DHCP acquisition.",
    },
    advanced: {
      whatHappened:
        "Port state machine progressed: Disabled -> Blocking (drops data, receives BPDUs) -> Listening (processes BPDUs, no MAC learning) -> Learning (builds CAM table) -> Forwarding.",
      whyItHappened:
        "Ensures CAM (Content Addressable Memory) table consistency across the broadcast domain before data frames are switched.",
      protocolRule:
        "IEEE 802.1D Timer Specifications: Forward Delay default is 15 seconds; Max Age default is 20 seconds.",
      fieldsChanged: ["port.state", "camAgingTime"],
      whatHappensNext:
        "Full Layer-2 unicast and multicast switching active on the converged tree.",
      misconception:
        "RSTP also requires 30s timers. (RSTP uses explicit Proposal/Agreement handshakes for sub-second ~50ms convergence).",
      realWorldUse:
        "Modern networks deploy RSTP (802.1w) or MSTP (802.1s) to eliminate the 30-50 second convergence penalty.",
    },
  },
  {
    eventType: "topology-change",
    beginner: {
      whatHappened:
        "A link failed! The switch sent a Topology Change Notification (TCN) BPDU upstream towards the Root Bridge.",
      whyItHappened:
        "When an active link goes down, switches must re-route traffic via the standby alternate link immediately.",
      protocolRule:
        "Switch sends TCN BPDU out Root Port. Root Bridge sets the Topology Change (TC) bit in its Hello BPDUs.",
      fieldsChanged: ["topologyChangeFlag", "camAgingTime"],
      whatHappensNext:
        "All switches temporarily reduce their MAC address table aging time from 300 seconds to 15 seconds to clear outdated paths.",
      misconception:
        "TCN completely clears/deletes the entire MAC table instantly. (It shortens aging timer to 15s so inactive entries expire quickly).",
      realWorldUse:
        "Prevents traffic from being blackholed towards severed ports following link flips or hardware faults.",
    },
    advanced: {
      whatHappened:
        "Link failure detected via loss of 3 consecutive Hello BPDUs (or physical carrier loss). Switch generates BPDU Type 0x80 (TCN).",
      whyItHappened:
        "MAC tables across all switches contain mappings pointing to the dead link; stale entries must be purged quickly.",
      protocolRule:
        "IEEE 802.1D Clause 9: Designated bridge acknowledges TCN with TCA (Bit 7). Root propagates TC (Bit 0) for (Max Age + Forward Delay) seconds.",
      fieldsChanged: ["flags.topologyChange", "flags.topologyChangeAck", "camAgingTime"],
      whatHappensNext:
        "Alternate port on standby link transitions to Forwarding to restore full connectivity.",
      misconception:
        "End-user ports should trigger TCNs. (Edge ports / PortFast ports should NOT generate TCNs upon link up/down).",
      realWorldUse:
        "BackboneFast and UplinkFast Cisco optimizations bypass Max Age timer (20s) for instant 1-3 second recovery.",
    },
  },
  {
    eventType: "rstp-proposal-agreement",
    beginner: {
      whatHappened:
        "RSTP (802.1w) used a Proposal / Agreement handshake on a point-to-point link for immediate sub-second convergence.",
      whyItHappened:
        "Instead of waiting 30 seconds for timers, RSTP switches actively negotiate port roles directly between neighbors.",
      protocolRule:
        "IEEE 802.1w: Designated port sends Proposal bit; downstream switch puts non-edge ports into Sync and replies with Agreement bit.",
      fieldsChanged: ["flags.proposal", "flags.agreement", "port.state"],
      whatHappensNext:
        "The port immediately enters Forwarding state in milliseconds without timer delays.",
      misconception:
        "RSTP needs special hubs. (RSTP requires full-duplex point-to-point links for rapid proposal/agreement sync).",
      realWorldUse:
        "Default spanning-tree mode in modern data centers and enterprise campus switches (Rapid-PVST+ / MSTP).",
    },
    advanced: {
      whatHappened:
        "RSTP synchronization mechanism: Root Port receives Proposal (Bit 1), blocks all non-edge designated ports (Sync state), and returns Agreement (Bit 6).",
      whyItHappened:
        "Guarantees that unblocking the link cannot create a temporary loop because all other paths are temporarily isolated.",
      protocolRule:
        "IEEE 802.1w Clause 17.29 (Sync and Proposing State Machine).",
      fieldsChanged: ["flags.proposal", "flags.agreement", "flags.forwarding", "port.state"],
      whatHappensNext:
        "Wave of sync propagates down the tree in milliseconds, bringing entire enterprise network to full forwarding.",
      misconception:
        "RSTP is backwards incompatible with legacy 802.1D STP. (RSTP automatically falls back to 802.1D timers per-port when legacy BPDU is detected).",
      realWorldUse:
        "Provides 10ms - 50ms voice/video call survival across redundant core link failures.",
    },
  },
];
