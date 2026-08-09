import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { DEFAULT_OSPF_TOPOLOGY, defaultOspfConfig } from "./ospf.defaults";
import { ospfConfigSchema } from "./ospf.schema";
import { generateOspfSimulation } from "./ospf.simulator";
import { OSPF_EXPLANATION_SECTIONS } from "./ospf.explanations";

export const ospfModule: ProtocolModule = {
  id: "ospf",
  name: "OSPF — Open Shortest Path First",
  category: "routing",
  layer: "Network (Layer 3)",
  summary:
    "Visualize neighbor discovery, link-state advertisements, shortest-path calculation, and route convergence.",
  status: "implemented",
  learningObjectives: [
    "Understand OSPF neighbor discovery and the 7-state adjacency machine (Down to Full)",
    "Learn how Link-State Advertisements (LSAs) flood through an OSPF area to build the Link-State Database (LSDB)",
    "Inspect Dijkstra's Shortest Path First (SPF) algorithm calculating lowest-cost paths step by step",
    "Observe how link failures and metric changes trigger dynamic LSA updates and automatic route reconvergence",
    "Identify common OSPF misconfigurations including Area ID mismatches, timer mismatches, and duplicate Router IDs",
  ],
  defaultTopology: DEFAULT_OSPF_TOPOLOGY,
  configurationSchema: ospfConfigSchema,
  defaultConfiguration: defaultOspfConfig,
  generateSimulation: generateOspfSimulation,
  packetFields: [
    { layer: "Network", name: "Version", description: "OSPF version (Version 2 for IPv4, Version 3 for IPv6)" },
    { layer: "Network", name: "Type", description: "OSPF Packet Type (1=Hello, 2=DBD, 3=LSR, 4=LSU, 5=LSAck)" },
    { layer: "Network", name: "Packet Length", description: "Length of the OSPF packet in bytes" },
    { layer: "Network", name: "Router ID", description: "32-bit identifier of the advertising router" },
    { layer: "Network", name: "Area ID", description: "32-bit identifier of the OSPF area (0.0.0.0 for backbone)" },
    { layer: "Network", name: "Checksum", description: "Standard IP checksum for header and data integrity" },
    { layer: "Network", name: "AuType", description: "Authentication type (0=None, 1=Simple, 2=MD5)" },
  ],
  explanationSections: OSPF_EXPLANATION_SECTIONS,
  simplificationNotes: [
    "This educational OSPF model implements OSPFv2 Type-1 Router LSAs and Point-to-Point neighbor adjacencies.",
    "DR/BDR election logic and Type-2/3/4/5 LSAs are simplified to highlight core link-state and Dijkstra algorithm principles.",
  ],
};
