# Networking Assumptions & Simplifications

This document describes educational simplifications in NetViz Studio simulations.

## TCP

- **Fixed ISN**: Initial sequence numbers are configurable but not randomized
- **Simplified congestion control**: Chart shows basic cwnd growth, not full Reno/Cubic
- **Single RTO strategy**: Timeout-based retransmission shown by default; fast retransmit not fully modeled
- **No SACK**: Selective acknowledgements not demonstrated
- **No window scaling**: Fixed window size
- **Two-node topology**: Single sender/receiver link

## UDP

- **No checksum validation failures**
- **Application responses labeled**: Any reply is explicitly marked as application-level, not UDP ACK
- **No multicast/broadcast**

## CIDR

- **IPv4 only** in Phase 1
- **Legacy class display**: Class A-E shown for reference; modern networks use classless CIDR
- **/31 handling**: RFC 3021 point-to-point semantics — both addresses usable
- **/32 handling**: Single host route, one usable address
- **/0**: Entire IPv4 space; usable host count reflects full range minus traditional reservations

## General

- **Packet inspector**: Educational header view, not real packet capture
- **No physical layer details**: Simplified Ethernet headers
- **Deterministic with seed**: Optional seeded randomness for loss simulation

## Planned Protocol Simplifications (Future Phases)

### OSPF
- Single area (Area 0)
- Simplified LSA types
- Educational Dijkstra SPF (not full OSPF spec)

### BGP
- Simplified path selection (documented decision steps)
- Not vendor-specific implementation
