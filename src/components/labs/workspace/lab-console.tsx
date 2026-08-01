"use client";

import React, { useState } from "react";
import { useTopologyStore } from "@/features/topology/topology-store";
import { runForwardingSimulation } from "@/features/forwarding/forwarding-engine";
import { ScrollArea } from "@/components/ui";
import { Terminal } from "lucide-react";

export function LabConsole() {
  const { topology } = useTopologyStore();
  const [history, setHistory] = useState<Array<{ cmd: string; output: string }>>([
    { cmd: "", output: "NetViz Simulated CLI v1.0. Type 'help' for available commands (ping, ipconfig, show ip route, show arp, nslookup, curl)." },
  ]);
  const [inputVal, setInputVal] = useState("");

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    let output = "";
    const lower = cmd.toLowerCase();

    if (lower === "help") {
      output = `Available Commands:
  ping <ip_or_name>      Test connectivity
  ipconfig / show ip    Display IP addresses
  show ip route         Display routing table
  show arp / arp -a     Display ARP cache entries
  show mac address-table Display switch MAC table
  nslookup <hostname>   Query DNS resolution
  clear                 Clear console screen`;
    } else if (lower === "clear") {
      setHistory([]);
      setInputVal("");
      return;
    } else if (lower.startsWith("ping ")) {
      const target = cmd.split(" ")[1];
      const targetNode = topology.nodes.find(
        (n) => n.id === target || n.name.toLowerCase() === target.toLowerCase() || n.interfaces.some((i) => i.ipv4?.address === target)
      );

      if (!targetNode) {
        output = `Ping request could not find host ${target}. Please check name and try again.`;
      } else {
        const srcNode = topology.nodes.find((n) => n.type === "pc" || n.type === "laptop") || topology.nodes[0];
        const res = runForwardingSimulation(topology, {
          id: "cli-ping",
          name: "CLI Ping",
          trafficType: "ping",
          sourceNodeId: srcNode.id,
          destinationNodeId: targetNode.id,
          protocol: "ICMP",
        });

        if (res.success) {
          output = `Pinging ${targetNode.name} [${res.packet.destinationIp}] with 32 bytes of data:
Reply from ${res.packet.destinationIp}: bytes=32 time=2ms TTL=64
Reply from ${res.packet.destinationIp}: bytes=32 time=1ms TTL=64
Reply from ${res.packet.destinationIp}: bytes=32 time=2ms TTL=64

Ping statistics for ${res.packet.destinationIp}:
    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)`;
        } else {
          output = `Pinging ${targetNode.name}:
Request timed out.
Destination host unreachable.

Ping statistics: Sent = 3, Received = 0, Lost = 3 (100% loss)`;
        }
      }
    } else if (lower.startsWith("ipconfig") || lower.startsWith("show ip interface")) {
      output = topology.nodes
        .map((n) => {
          const ips = n.interfaces.map((i) => `    ${i.name}: ${i.ipv4?.address || "unassigned"}/${i.ipv4?.prefixLength || ""}`).join("\n");
          return `${n.name} (${n.type}):\n    Gateway: ${n.configuration.defaultGateway || "none"}\n${ips}`;
        })
        .join("\n\n");
    } else if (lower.startsWith("show ip route")) {
      output = topology.nodes
        .filter((n) => n.routingTable && n.routingTable.length > 0)
        .map((n) => {
          const routes = (n.routingTable || [])
            .map((r) => `    ${r.source.toUpperCase()} ${r.destinationPrefix}/${r.prefixLength} via ${r.nextHop || "direct"} (${r.exitInterfaceName})`)
            .join("\n");
          return `Routing Table for ${n.name}:\n${routes}`;
        })
        .join("\n\n");
      if (!output) output = "No active Layer 3 routes configured.";
    } else if (lower.startsWith("show arp") || lower.startsWith("arp -a")) {
      output = topology.nodes
        .filter((n) => n.arpTable && n.arpTable.length > 0)
        .map((n) => {
          const entries = (n.arpTable || []).map((e) => `    IP: ${e.ipAddress} -> MAC: ${e.macAddress}`).join("\n");
          return `ARP Cache for ${n.name}:\n${entries}`;
        })
        .join("\n\n");
      if (!output) output = "ARP caches are currently empty.";
    } else {
      output = `Command not recognized: '${cmd}'. Type 'help' for list of commands.`;
    }

    setHistory((prev) => [...prev, { cmd, output }]);
    setInputVal("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono text-xs overflow-hidden border-t border-border">
      <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 border-b border-slate-800 shrink-0">
        <Terminal className="h-3.5 w-3.5 text-emerald-400" />
        <span className="font-semibold text-slate-300">Simulated Network Diagnostic Terminal</span>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              {item.cmd && (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span>netviz-cli&gt;</span>
                  <span className="text-slate-100 font-semibold">{item.cmd}</span>
                </div>
              )}
              <pre className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap font-mono">{item.output}</pre>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleCommand} className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 border-t border-slate-800 shrink-0">
        <span className="text-emerald-400 font-bold">netviz-cli&gt;</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type command (e.g. ping PC-2)..."
          className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs"
        />
      </form>
    </div>
  );
}
