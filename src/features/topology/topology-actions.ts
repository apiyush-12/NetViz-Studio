import { useTopologyStore } from "@/features/topology/topology-store";

export function injectFailure(
  type: "disable-node" | "disable-interface" | "break-link" | "clear-arp" | "clear-routing" | "restore-all",
  targetId?: string
) {
  const store = useTopologyStore.getState();

  if (type === "disable-node" && targetId) {
    store.updateNode(targetId, { status: "offline" });
  } else if (type === "break-link" && targetId) {
    store.updateLink(targetId, { administrativeState: "down", operationalState: "down" });
  } else if (type === "clear-arp" && targetId) {
    store.updateNode(targetId, { arpTable: [] });
  } else if (type === "clear-routing" && targetId) {
    store.updateNode(targetId, { routingTable: [] });
  } else if (type === "restore-all") {
    store.topology.nodes.forEach((n) => {
      store.updateNode(n.id, { status: "online" });
    });
    store.topology.links.forEach((l) => {
      store.updateLink(l.id, { administrativeState: "up", operationalState: "up" });
    });
  }
}
