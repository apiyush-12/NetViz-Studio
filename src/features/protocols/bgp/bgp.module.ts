import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { DEFAULT_BGP_TOPOLOGY, defaultBgpConfig } from "./bgp.defaults";
import { bgpConfigSchema } from "./bgp.schema";
import { generateBgpSimulation } from "./bgp.simulator";
import { BGP_EXPLANATION_SECTIONS } from "./bgp.explanations";

export const bgpModule: ProtocolModule = {
  id: "bgp",
  name: "BGP — Border Gateway Protocol",
  category: "routing",
  layer: "Network (Layer 3)",
  summary:
    "Visualize autonomous systems, route advertisements, path attributes, best-path selection, and Internet routing decisions.",
  status: "implemented",
  learningObjectives: [
    "Understand Autonomous Systems (AS) and how eBGP peers exchange routing policies",
    "Learn the BGP session state machine (Idle, Connect, Active, OpenSent, OpenConfirm, Established) over TCP 179",
    "Observe AS_PATH attribute prepending across AS boundaries and how it guarantees loop prevention",
    "Inspect the deterministic BGP Best-Path Decision algorithm comparing LOCAL_PREF, AS_PATH, and MED",
    "Simulate policy-based traffic engineering using AS-path prepends, prefix withdrawals, and multi-homing link failovers",
  ],
  defaultTopology: DEFAULT_BGP_TOPOLOGY,
  configurationSchema: bgpConfigSchema,
  defaultConfiguration: defaultBgpConfig,
  generateSimulation: generateBgpSimulation,
  packetFields: [
    { layer: "Application", name: "Type", description: "BGP Message Type (1=OPEN, 2=UPDATE, 3=NOTIFICATION, 4=KEEPALIVE)" },
    { layer: "Application", name: "Length", description: "Total length of the BGP message in octets (19 to 4096)" },
    { layer: "Application", name: "My AS", description: "16-bit or 32-bit Autonomous System Number of the sender" },
    { layer: "Application", name: "Hold Time", description: "Number of seconds sender proposes for the hold timer" },
    { layer: "Application", name: "BGP Identifier", description: "IPv4-formatted 32-bit router identifier" },
    { layer: "Application", name: "Path Attributes", description: "AS_PATH, NEXT_HOP, LOCAL_PREF, and MED attributes" },
    { layer: "Application", name: "NLRI", description: "Network Layer Reachability Information (IP prefix/length)" },
  ],
  explanationSections: BGP_EXPLANATION_SECTIONS,
  simplificationNotes: [
    "This visualizer uses a simplified vendor-neutral BGP decision process for education. Exact path selection can differ depending on implementation, configuration, and policy.",
    "Focuses on eBGP inter-domain path selection, AS_PATH propagation, LOCAL_PREF, and MED comparisons across 4 Autonomous Systems.",
  ],
};
