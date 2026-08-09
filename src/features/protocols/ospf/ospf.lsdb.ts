import type { OspfRouter, OspfLink, OspfLsa, OspfLsaLink } from "./ospf.types";

export function generateRouterLsa(
  router: OspfRouter,
  links: OspfLink[],
  allRouters: OspfRouter[]
): OspfLsa {
  const lsaLinks: OspfLsaLink[] = [];

  router.interfaces.forEach((iface) => {
    if (!iface.enabled) return;

    if (iface.passive) {
      // Stub network
      lsaLinks.push({
        linkId: iface.ipAddress.replace(/\.\d+$/, ".0"),
        linkData: "255.255.255.0",
        type: "stub",
        metric: iface.cost,
      });
      return;
    }

    // Check connected active links
    const connectedLink = links.find(
      (l) =>
        l.enabled &&
        l.status === "up" &&
        ((l.sourceRouterId === router.nodeId && l.sourceInterfaceId === iface.id) ||
          (l.targetRouterId === router.nodeId && l.targetInterfaceId === iface.id))
    );

    if (connectedLink) {
      const neighborNodeId =
        connectedLink.sourceRouterId === router.nodeId
          ? connectedLink.targetRouterId
          : connectedLink.sourceRouterId;
      const neighborRouter = allRouters.find((r) => r.nodeId === neighborNodeId);

      if (neighborRouter) {
        lsaLinks.push({
          linkId: neighborRouter.routerId,
          linkData: iface.ipAddress,
          type: "point-to-point",
          metric: connectedLink.cost ?? iface.cost,
          neighborRouterId: neighborRouter.nodeId,
        });
      }
    }
  });

  return {
    id: `lsa-type1-${router.routerId}`,
    type: "Router (Type 1)",
    advertisingRouter: router.routerId,
    linkStateId: router.routerId,
    sequenceNumber: "0x80000001",
    age: 1,
    checksum: "0x4F1A",
    links: lsaLinks,
  };
}

export function buildSynchronizedLsdb(
  routers: OspfRouter[],
  links: OspfLink[]
): OspfLsa[] {
  return routers
    .filter((r) => r.state !== "Disabled")
    .map((r) => generateRouterLsa(r, links, routers));
}
