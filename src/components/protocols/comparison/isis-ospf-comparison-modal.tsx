"use client";

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  X,
  Cpu,
  Shield,
} from "lucide-react";
import {
  Button,
  Tabs,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";

interface IsisOspfComparisonModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IsisOspfComparisonModal({
  isOpen: controlledIsOpen,
  onOpenChange,
}: IsisOspfComparisonModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("comparison");

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const comparisonData = [
    {
      dimension: "Transport Layer & Framing",
      isis: "Direct Data-Link Layer (Layer 2) encapsulation (OSI LLC DSAP/SSAP 0xFEFE, Control 0x03, NLPID 0x83). Completely immune to IP-layer spoofing and IP stack attacks.",
      ospf: "Direct IP Encapsulation (IP Protocol 89) using IP multicast (224.0.0.5 / 224.0.0.6). Requires a functional IP stack and is subject to IP-level attacks.",
      bgp: "Layer 4 TCP Port 179. Establishes reliable point-to-point unicast transport with session state machines.",
    },
    {
      dimension: "Hierarchical Area Boundaries",
      isis: "Router-Centric Area Boundaries. An entire router belongs to an Area (Level 1 or Level 2). Level 1/2 border routers connect Level 1 areas to the contiguous Level 2 backbone.",
      ospf: "Link/Interface-Centric Area Boundaries. A single router (ABR) can have different interfaces assigned to different Areas. Area 0 (Backbone) is interface-bound.",
      bgp: "Autonomous System (AS) boundaries. Routers peer internally (iBGP) or across administrative domain boundaries (eBGP).",
    },
    {
      dimension: "Broadcast LAN Multi-Access Election",
      isis: "Designated Intermediate System (DIS). Preemptible immediately when higher priority arrives (0-127). No Backup DIS exists. DIS creates Pseudonode LSPs and multicasts CSNPs every 10s.",
      ospf: "Designated Router (DR) & Backup DR (BDR). Non-preemptible election. If DR fails, BDR is instantly promoted without full re-election.",
      bgp: "No LAN designated router; point-to-point TCP peering sessions between individual speakers (or Route Reflectors / Confederations).",
    },
    {
      dimension: "Extensibility & Architecture",
      isis: "Pure TLV (Type-Length-Value) Architecture. Adding new features (IPv6, Wide Metrics, Segment Routing, MPLS-TE) requires only defining new TLVs without rewriting the parser or base protocol.",
      ospf: "Rigid LSA Type format (Types 1 to 11 in OSPFv2). Adding features requires new Opaque LSAs (Types 9-11) or completely new protocol revisions (OSPFv3).",
      bgp: "Path Attributes (Flags, Type Code, Length, Value) and Multiprotocol Extensions (MP-BGP RFC 4760 AFI/SAFI).",
    },
    {
      dimension: "Dual-Stack IPv4 / IPv6 Support",
      isis: "Native Integrated IS-IS (Single Control Plane). IPv4 and IPv6 routing run concurrently in the exact same IS-IS process via TLV 135 (IPv4) and TLV 236 (IPv6).",
      ospf: "Dual Independent Protocols. Requires running OSPFv2 (RFC 2328) for IPv4 and an entirely separate OSPFv3 (RFC 5340) process with duplicate memory/CPU for IPv6.",
      bgp: "Multiprotocol BGP (MP-BGP) running across single or dual BGP sessions using AFI/SAFI address families.",
    },
    {
      dimension: "Metric Resolution & TE Scalability",
      isis: "Wide Metrics (RFC 5305): 24-bit interface cost (1 to 16,777,215) and 32-bit total path metric. Essential for Traffic Engineering, CSPF, and fine-grained backbone steering.",
      ospf: "16-bit Interface Metric (1 to 65,535) based on 100Mbps reference bandwidth. Can saturate on 100G/400G links without custom reference bandwidth adjustments.",
      bgp: "Multi-Attribute Decision Tree (Weight, Local Pref, AS-Path, MED, Origin, eBGP > iBGP).",
    },
    {
      dimension: "Default Routing & Route Leaking",
      isis: "Dynamic Attached Bit (ATT=1) automatically set on L1/L2 border routers. Level 1 routers automatically install default route ::/0. RFC 2966 Route Leaking with Up/Down (U/D) bit prevents loops.",
      ospf: "ABRs automatically generate Type-3 Summary LSAs into non-backbone areas. Stub and NSSA areas receive default Type-3 / Type-7 LSAs.",
      bgp: "Originated default route via `default-information originate` or `neighbor default-originate` policy.",
    },
    {
      dimension: "Industry Adoption & Use Cases",
      isis: "Dominant standard in Service Provider Backbones, Tier-1 Telco Transits, and Hyperscale Cloud DC Fabrics (due to TLV agility, fast convergence, and Layer 2 isolation).",
      ospf: "Dominant standard in Enterprise LANs, Campus Networks, and Data Centers with multi-vendor standard routing.",
      bgp: "Universal standard for Global Internet Inter-domain routing, Data Center EVPN-VXLAN Underlay/Overlay, and Cloud Interconnects.",
    },
  ];

  return (
    <>
      {controlledIsOpen === undefined && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="text-xs h-7 px-2.5 gap-1.5 cursor-pointer border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>IS-IS vs OSPF vs BGP Comparison</span>
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col border-border bg-card shadow-2xl overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Link-State Architecture: IS-IS vs OSPF vs BGP Deep Comparison
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    ISO/IEC 10589 &bull; RFC 1195 &bull; RFC 2328 &bull; RFC 5308 &bull; RFC 4271
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  tabs={[
                    { id: "comparison", label: "Protocol Comparison Matrix" },
                    { id: "architecture", label: "Area & Header Architecture" },
                  ]}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 overflow-y-auto space-y-4 text-xs">
              {activeTab === "comparison" && (
                <div className="border border-border/80 rounded-lg overflow-x-auto shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border/80">
                        <th className="p-3 font-semibold text-foreground w-[20%]">Dimension</th>
                        <th className="p-3 font-semibold text-emerald-400 w-[28%] bg-emerald-500/10">
                          IS-IS (ISO 10589 / RFC 1195)
                        </th>
                        <th className="p-3 font-semibold text-blue-400 w-[26%] bg-blue-500/10">
                          OSPF (OSPFv2 / OSPFv3)
                        </th>
                        <th className="p-3 font-semibold text-purple-400 w-[26%] bg-purple-500/10">
                          BGP-4 (RFC 4271)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {comparisonData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-3 font-semibold text-foreground bg-secondary/10">
                            {row.dimension}
                          </td>
                          <td className="p-3 text-muted-foreground leading-relaxed bg-emerald-500/5">
                            {row.isis}
                          </td>
                          <td className="p-3 text-muted-foreground leading-relaxed bg-blue-500/5">
                            {row.ospf}
                          </td>
                          <td className="p-3 text-muted-foreground leading-relaxed bg-purple-500/5">
                            {row.bgp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "architecture" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* IS-IS Area Design */}
                  <div className="p-4 rounded-lg bg-secondary/20 border border-border/70 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                        <Shield className="h-4 w-4" />
                      </div>
                      <h4 className="font-semibold text-sm text-foreground">
                        IS-IS Router-Centric Area Model
                      </h4>
                    </div>

                    <p className="text-muted-foreground text-xs leading-relaxed">
                      In IS-IS, the router itself belongs to a single Area or connects as a Level 1/2 Border Router. The boundary between areas is on the links between L1/L2 and L2 routers, rather than inside the router.
                    </p>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                        <strong>Level 1 (L1):</strong> Intra-Area routing only. Possesses complete L1 LSDB of its local area. Uses ATT=1 default route to exit.
                      </div>
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">
                        <strong>Level 2 (L2):</strong> Contiguous Inter-Area Backbone routing. Connects disparate L1 areas together.
                      </div>
                      <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                        <strong>Level 1/2 (L1/L2):</strong> Dual-database border router. Maintains separate L1 and L2 LSDBs and executes two independent SPF runs.
                      </div>
                    </div>
                  </div>

                  {/* OSPF Area Design */}
                  <div className="p-4 rounded-lg bg-secondary/20 border border-border/70 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <h4 className="font-semibold text-sm text-foreground">
                        OSPF Interface-Centric Area Model
                      </h4>
                    </div>

                    <p className="text-muted-foreground text-xs leading-relaxed">
                      In OSPF, individual interfaces belong to Areas. An Area Border Router (ABR) sits directly on the boundary with at least one interface in Area 0 and others in peripheral areas.
                    </p>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300">
                        <strong>Area 0 (Backbone):</strong> Central core to which all other OSPF areas must directly or virtually attach.
                      </div>
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                        <strong>Standard Non-Backbone:</strong> Floods intra-area Type-1 & Type-2 LSAs, receives inter-area Type-3 Summary LSAs from ABR.
                      </div>
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        <strong>Stub / NSSA Areas:</strong> Filter external Type-5 LSAs or translate NSSA Type-7 LSAs into Type-5 at the ABR border.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
