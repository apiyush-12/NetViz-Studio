import { RoutingTableEntry } from "@/features/topology/topology-types";

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

export interface LpmMatchResult {
  selectedRoute: RoutingTableEntry | null;
  allMatches: RoutingTableEntry[];
  explanation: string;
}

export function findLongestPrefixMatch(
  destinationIp: string,
  routingTable: RoutingTableEntry[]
): LpmMatchResult {
  const destLong = ipToLong(destinationIp);
  const activeRoutes = routingTable.filter((r) => r.active);

  const matches: Array<{ route: RoutingTableEntry; prefixLength: number; ad: number; metric: number }> = [];

  for (const route of activeRoutes) {
    if (route.destinationPrefix === "0.0.0.0" && route.prefixLength === 0) {
      // Default route
      matches.push({ route, prefixLength: 0, ad: route.administrativeDistance, metric: route.metric });
      continue;
    }

    const routeLong = ipToLong(route.destinationPrefix);
    const mask = route.prefixLength === 0 ? 0 : ((0xffffffff << (32 - route.prefixLength)) >>> 0);

    if ((destLong & mask) === (routeLong & mask)) {
      matches.push({ route, prefixLength: route.prefixLength, ad: route.administrativeDistance, metric: route.metric });
    }
  }

  if (matches.length === 0) {
    return {
      selectedRoute: null,
      allMatches: [],
      explanation: `No route in routing table matches destination IP ${destinationIp}. Packet will be dropped (ICMP Destination Network Unreachable).`,
    };
  }

  // Sort by prefix length descending, then AD ascending, then metric ascending
  matches.sort((a, b) => {
    if (b.prefixLength !== a.prefixLength) return b.prefixLength - a.prefixLength; // Longest prefix wins
    if (a.ad !== b.ad) return a.ad - b.ad; // Lowest AD wins
    return a.metric - b.metric; // Lowest metric wins
  });

  const bestMatch = matches[0];
  const allMatches = matches.map((m) => m.route);

  let explanation = `Matched ${matches.length} route(s). `;
  if (bestMatch.prefixLength > 0) {
    explanation += `Selected route to ${bestMatch.route.destinationPrefix}/${bestMatch.prefixLength} via ${bestMatch.route.nextHop} (${bestMatch.route.exitInterfaceName}) because it has the longest matching prefix (/${bestMatch.prefixLength}).`;
  } else {
    explanation += `Selected default route 0.0.0.0/0 via ${bestMatch.route.nextHop} (${bestMatch.route.exitInterfaceName}).`;
  }

  return {
    selectedRoute: bestMatch.route,
    allMatches,
    explanation,
  };
}
