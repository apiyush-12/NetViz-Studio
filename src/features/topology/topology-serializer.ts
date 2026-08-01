import { NetworkTopology } from "@/features/topology/topology-types";

export function serializeTopology(topology: NetworkTopology): string {
  return JSON.stringify(topology, null, 2);
}

export function deserializeTopology(jsonString: string): {
  success: boolean;
  topology?: NetworkTopology;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString) as NetworkTopology;

    if (!data.id || !data.nodes || !Array.isArray(data.nodes) || !data.links || !Array.isArray(data.links)) {
      return {
        success: false,
        error: "Invalid topology schema: Missing required fields (id, nodes array, links array).",
      };
    }

    const sanitizedTopology: NetworkTopology = {
      id: data.id || `topo-${Date.now()}`,
      name: data.name || "Imported Topology",
      description: data.description || "",
      version: data.version || 1,
      nodes: data.nodes,
      links: data.links,
      groups: data.groups || [],
      settings: data.settings || {
        gridSnap: true,
        autoSave: true,
        labelVisibility: {
          showInterfaceNames: true,
          showIpAddresses: true,
          showLinkCost: true,
          showBandwidth: false,
          showLatency: false,
          showPacketLabels: true,
        },
      },
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      topology: sanitizedTopology,
    };
  } catch (err) {
    return {
      success: false,
      error: `JSON Syntax Error: ${(err as Error).message}`,
    };
  }
}
