import type { DhcpNode, DhcpPool, DhcpLease } from "./dhcp.types";

export interface DhcpValidationError {
  id: string;
  severity: "error" | "warning" | "info";
  title: string;
  message: string;
  recommendation: string;
}

export function validateDhcpConfiguration(
  nodes: DhcpNode[],
  pool: DhcpPool,
  activeLeases: DhcpLease[]
): DhcpValidationError[] {
  const errors: DhcpValidationError[] = [];

  // Check 1: Ensure at least one DHCP Server is active
  const servers = nodes.filter((n) => n.type === "server" && n.enabled);
  if (servers.length === 0) {
    errors.push({
      id: "no-active-server",
      severity: "error",
      title: "No Active DHCP Server Found",
      message: "No enabled DHCP server exists on the network to service client DISCOVER broadcasts.",
      recommendation: "Enable at least one DHCP server or configure a DHCP Relay Agent pointing to a reachable remote server.",
    });
  }

  // Check 2: Rogue DHCP Server detection
  const rogueServer = nodes.find((n) => n.role === "rogue-server" && n.enabled);
  if (rogueServer) {
    errors.push({
      id: "rogue-server-detected",
      severity: "warning",
      title: "Untrusted / Rogue DHCP Server Active",
      message: `An unauthorized DHCP Server (${rogueServer.name} - ${rogueServer.ipAddress ?? "Unknown IP"}) is connected to the access switch.`,
      recommendation: "Enable DHCP Snooping on the switch to drop DHCPOFFER packets arriving on untrusted access ports.",
    });
  }

  // Check 3: Pool exhaustion
  const startNum = parseInt(pool.startAddress.split(".")[3], 10);
  const endNum = parseInt(pool.endAddress.split(".")[3], 10);
  const totalCapacity = Math.max(0, endNum - startNum + 1);
  const activeCount = activeLeases.filter((l) => l.state === "active").length;

  if (totalCapacity === 0 || startNum > endNum) {
    errors.push({
      id: "invalid-pool-range",
      severity: "error",
      title: "Invalid Address Pool Range",
      message: `Pool start IP (${pool.startAddress}) is greater than end IP (${pool.endAddress}).`,
      recommendation: "Set a valid ascending IPv4 address range for the DHCP scope.",
    });
  } else if (activeCount >= totalCapacity) {
    errors.push({
      id: "pool-exhausted",
      severity: "error",
      title: "DHCP Address Scope Exhausted",
      message: `All ${totalCapacity} available IP addresses in pool ${pool.name} are currently leased.`,
      recommendation: "Expand the DHCP pool scope (e.g. increase prefix from /24 to /23) or reduce lease duration.",
    });
  }

  // Check 4: Gateway subnet consistency
  if (!pool.gateway || pool.gateway === "0.0.0.0") {
    errors.push({
      id: "missing-gateway",
      severity: "warning",
      title: "Missing Default Gateway (Option 3)",
      message: "DHCP scope does not provide a default router/gateway to clients.",
      recommendation: "Configure Option 3 (Router) so clients can reach external networks.",
    });
  }

  return errors;
}
