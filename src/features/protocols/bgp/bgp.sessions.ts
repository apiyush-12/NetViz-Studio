import type { BgpSessionState, BgpPeer, BgpRouter, BgpLink } from "./bgp.types";

export interface BgpSessionCheckResult {
  compatible: boolean;
  reason?: string;
  targetState: BgpSessionState;
}

export function checkBgpPeeringCompatibility(
  routerA: BgpRouter,
  peerA: BgpPeer,
  routerB: BgpRouter,
  peerB: BgpPeer,
  link: BgpLink
): BgpSessionCheckResult {
  if (!link.enabled || link.status === "down") {
    return {
      compatible: false,
      reason: "Physical link between autonomous systems is down. TCP connection cannot establish.",
      targetState: "idle",
    };
  }

  if (!peerA.enabled || !peerB.enabled) {
    return {
      compatible: false,
      reason: "BGP peering is administratively disabled on one or both routers.",
      targetState: "idle",
    };
  }

  if (peerA.remoteAsn !== routerB.localAsn) {
    return {
      compatible: false,
      reason: `Remote ASN mismatch: ${routerA.name} expected remote AS ${peerA.remoteAsn}, but ${routerB.name} is in AS ${routerB.localAsn}. BGP OPEN rejected with NOTIFICATION (Bad Peer AS).`,
      targetState: "active",
    };
  }

  if (peerB.remoteAsn !== routerA.localAsn) {
    return {
      compatible: false,
      reason: `Remote ASN mismatch: ${routerB.name} expected remote AS ${peerB.remoteAsn}, but ${routerA.name} is in AS ${routerA.localAsn}. BGP OPEN rejected.`,
      targetState: "active",
    };
  }

  return {
    compatible: true,
    targetState: "established",
  };
}

export const BGP_SESSION_STATE_EXPLANATIONS: Record<
  BgpSessionState,
  {
    summary: string;
    meaning: string;
    previous: string;
    next: string;
    stuckReason: string;
  }
> = {
  idle: {
    summary: "Idle State",
    meaning: "Initial state. BGP refuses all incoming connection requests and allocates no resources until a Start event occurs.",
    previous: "None (starting state) or session reset due to severe NOTIFICATION error.",
    next: "Connect (initiates TCP 3-way handshake over port 179).",
    stuckReason: "Peering administratively shutdown or no route to neighbor IP.",
  },
  connect: {
    summary: "Connect State",
    meaning: "BGP is waiting for the underlying TCP connection (port 179) to complete with the remote peer.",
    previous: "Idle (Start event triggered).",
    next: "OpenSent (if TCP handshake succeeds) or Active (if TCP connection fails).",
    stuckReason: "Firewall / ACL blocking TCP 179, routing failure, or remote peer interface down.",
  },
  active: {
    summary: "Active State",
    meaning: "TCP connection failed on initial attempt. BGP is actively trying to re-establish the TCP connection.",
    previous: "Connect (TCP connect timeout) or OpenSent (OPEN mismatch).",
    next: "OpenSent (if re-connection succeeds) or reverts to Idle (if connect retry timer expires repeatedly).",
    stuckReason: "Incorrect neighbor IP address, remote ASN mismatch, or TCP port 179 filtered.",
  },
  opensent: {
    summary: "OpenSent State",
    meaning: "TCP connection is up. BGP has sent a BGP OPEN message with its ASN, BGP Identifier, and Hold Time, and is waiting for the peer's OPEN message.",
    previous: "Connect or Active (TCP connection established).",
    next: "OpenConfirm (valid OPEN message received from peer).",
    stuckReason: "Autonomous System Number (ASN) mismatch, BGP version mismatch, or MD5 authentication password mismatch.",
  },
  openconfirm: {
    summary: "OpenConfirm State",
    meaning: "BGP received a valid OPEN message from the peer and sent a KEEPALIVE message. It is now waiting to receive a KEEPALIVE in response.",
    previous: "OpenSent (valid OPEN message processed).",
    next: "Established (KEEPALIVE received).",
    stuckReason: "High packet loss causing KEEPALIVE drops or Hold Time expiration.",
  },
  established: {
    summary: "Established State",
    meaning: "BGP session is fully operational! Peers exchange KEEPALIVE messages periodically and advertise/withdraw network prefixes using UPDATE messages.",
    previous: "OpenConfirm (KEEPALIVE received).",
    next: "Stable operational state; transitions to Idle only on link drop, hold timer expiration, or NOTIFICATION error.",
    stuckReason: "N/A (This is the ideal operational state for active BGP peerings).",
  },
};
