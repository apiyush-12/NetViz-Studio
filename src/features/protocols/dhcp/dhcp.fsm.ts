import type {
  DhcpClientState,
  DhcpLease,
  DhcpPool,
  DhcpPacketPayload,
  DhcpOption,
} from "./dhcp.types";

export interface DhcpFsmStep {
  stepIndex: number;
  fromState: DhcpClientState;
  toState: DhcpClientState;
  trigger: string;
  packetType?: string;
  description: string;
  timestampOffset: number;
}

export function buildDhcpOptions(
  messageType: DhcpPacketPayload["messageType"],
  pool: DhcpPool,
  serverId: string,
  serverIp: string,
  offeredIp?: string,
  giaddr?: string
): DhcpOption[] {
  const options: DhcpOption[] = [];

  // Option 53: DHCP Message Type
  const typeCodeMap: Record<DhcpPacketPayload["messageType"], number> = {
    DHCPDISCOVER: 1,
    DHCPOFFER: 2,
    DHCPREQUEST: 3,
    DHCPDECLINE: 4,
    DHCPACK: 5,
    DHCPNAK: 6,
    DHCPRELEASE: 7,
    DHCPINFORM: 8,
  };

  options.push({
    code: 53,
    name: "DHCP Message Type",
    value: `${messageType} (${typeCodeMap[messageType]})`,
  });

  // Option 54: Server Identifier
  if (messageType !== "DHCPDISCOVER") {
    options.push({
      code: 54,
      name: "Server Identifier",
      value: serverIp,
    });
  }

  // Option 51: IP Address Lease Time
  if (messageType === "DHCPOFFER" || messageType === "DHCPACK") {
    options.push({
      code: 51,
      name: "IP Address Lease Time",
      value: `${pool.leaseDurationSeconds}s (${Math.round(pool.leaseDurationSeconds / 3600)} hrs)`,
    });

    // Option 58: Renewal Time Value (T1) - 50%
    options.push({
      code: 58,
      name: "Renewal Time (T1)",
      value: `${pool.t1Seconds}s (50%)`,
    });

    // Option 59: Rebinding Time Value (T2) - 87.5%
    options.push({
      code: 59,
      name: "Rebinding Time (T2)",
      value: `${pool.t2Seconds}s (87.5%)`,
    });

    // Option 1: Subnet Mask
    options.push({
      code: 1,
      name: "Subnet Mask",
      value: pool.subnetMask,
    });

    // Option 3: Router (Default Gateway)
    options.push({
      code: 3,
      name: "Router / Default Gateway",
      value: pool.gateway,
    });

    // Option 6: Domain Name Server
    options.push({
      code: 6,
      name: "DNS Domain Name Server",
      value: pool.dnsServers.join(", "),
    });

    // Option 15: Domain Name
    options.push({
      code: 15,
      name: "Domain Name",
      value: pool.domainName,
    });
  }

  // Option 82: Relay Agent Information (if relayed)
  if (giaddr && giaddr !== "0.0.0.0") {
    options.push({
      code: 82,
      name: "Relay Agent Information",
      value: `Agent-GIADDR: ${giaddr}`,
    });
  }

  return options;
}

export function allocateLeaseFromPool(
  pool: DhcpPool,
  existingLeases: DhcpLease[],
  clientMac: string,
  clientHostname: string,
  serverId: string,
  serverIp: string,
  isPoolExhausted = false
): { lease: DhcpLease | null; isExhausted: boolean } {
  if (isPoolExhausted) {
    return { lease: null, isExhausted: true };
  }

  // Check if client already has active lease
  const existing = existingLeases.find(
    (l) => l.macAddress.toLowerCase() === clientMac.toLowerCase() && l.state === "active"
  );
  if (existing) {
    return { lease: existing, isExhausted: false };
  }

  // Determine next available IP
  const startNum = parseInt(pool.startAddress.split(".")[3], 10);
  const endNum = parseInt(pool.endAddress.split(".")[3], 10);
  const basePrefix = pool.startAddress.substring(0, pool.startAddress.lastIndexOf("."));

  for (let octet = startNum; octet <= endNum; octet++) {
    const candidateIp = `${basePrefix}.${octet}`;
    const inUse = existingLeases.some(
      (l) => l.ipAddress === candidateIp && l.state === "active"
    );
    if (!inUse) {
      const now = Date.now();
      const newLease: DhcpLease = {
        ipAddress: candidateIp,
        macAddress: clientMac,
        hostname: clientHostname,
        leaseStarts: now,
        leaseExpires: now + pool.leaseDurationSeconds * 1000,
        serverId,
        serverIp,
        state: "active",
      };
      return { lease: newLease, isExhausted: false };
    }
  }

  return { lease: null, isExhausted: true };
}
