"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { calculateCidr, splitSubnet } from "@/features/cidr/cidr-calculator";
import type { CidrResult } from "@/features/cidr/cidr-types";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, Badge, Tabs } from "@/components/ui";
import { copyToClipboard } from "@/lib/utils";

const EXAMPLES = ["192.168.1.10/24", "10.0.0.1/8", "172.16.5.100/20", "192.168.1.0/31", "10.0.0.1/32"];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button size="sm" variant="ghost" onClick={handleCopy} aria-label={`Copy ${label}`}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function ResultRow({ label, value }: { label: string; value: string | null }) {
  if (value === null) return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-xs">{value}</span>
        <CopyButton value={value} label={label} />
      </div>
    </div>
  );
}

function BinaryBar({ result }: { result: CidrResult }) {
  const networkBits = result.prefixLength;
  const binary = result.ipBinary.replace(/\./g, "");
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">32-bit address visualization</p>
      <div className="flex font-mono text-[10px] gap-px">
        {binary.split("").map((bit, i) => (
          <span
            key={i}
            className={`w-3 h-5 flex items-center justify-center rounded-sm ${
              i < networkBits ? "bg-primary/30 text-primary" : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {bit}
          </span>
        ))}
      </div>
      <div className="flex gap-4 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/30" /> Network ({networkBits} bits)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500/20" /> Host ({32 - networkBits} bits)</span>
      </div>
    </div>
  );
}

function AddressRangeBar({ result }: { result: CidrResult }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Address range</p>
      <div className="relative h-8 bg-secondary rounded-md overflow-hidden">
        <div className="absolute inset-y-0 left-0 right-0 bg-primary/20" />
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-mono">
          <span>{result.networkAddress}</span>
          <span className="text-muted-foreground">usable range</span>
          <span>{result.broadcastAddress}</span>
        </div>
      </div>
      <p className="text-xs font-mono text-center">{result.usableRange}</p>
    </div>
  );
}

export function CidrCalculator() {
  const [input, setInput] = useState("192.168.1.10/24");
  const [tab, setTab] = useState("calculator");
  const [splitBase, setSplitBase] = useState("192.168.1.0/24");
  const [splitPrefix, setSplitPrefix] = useState("26");
  const [result, setResult] = useState<ReturnType<typeof calculateCidr> | null>(null);
  const [splitResult, setSplitResult] = useState<CidrResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    const res = calculateCidr(input);
    if ("isValid" in res && res.isValid === false) {
      setError(res.message);
      setResult(null);
    } else {
      setError(null);
      setResult(res);
    }
  };

  const doSplit = () => {
    const res = splitSubnet(splitBase, Number(splitPrefix));
    if ("isValid" in res && res.isValid === false) {
      setError(res.message);
      setSplitResult(null);
    } else if ("subnets" in res) {
      setError(null);
      setSplitResult(res.subnets);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { id: "calculator", label: "Calculator" },
          { id: "splitter", label: "Subnet Splitter" },
        ]}
      />

      {tab === "calculator" && (
        <>
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="cidr-input">IPv4 Address / Prefix</Label>
              <Input
                id="cidr-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="192.168.1.10/24"
                aria-describedby={error ? "cidr-error" : undefined}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={calculate}>Calculate</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {EXAMPLES.map((ex) => (
              <Button key={ex} size="sm" variant="outline" onClick={() => { setInput(ex); }}>
                {ex}
              </Button>
            ))}
          </div>

          {error && (
            <p id="cidr-error" className="text-sm text-destructive" role="alert">{error}</p>
          )}

          {result && result.isValid && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Results</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.addressTypes.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                    <Badge variant="outline">Class {result.legacyClass}</Badge>
                    {result.isPointToPoint && <Badge variant="warning">Point-to-point (/31)</Badge>}
                    {result.isHostRoute && <Badge variant="warning">Host route (/32)</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ResultRow label="Network address" value={result.networkAddress} />
                  <ResultRow label="Broadcast address" value={result.broadcastAddress} />
                  <ResultRow label="Subnet mask" value={result.subnetMask} />
                  <ResultRow label="Wildcard mask" value={result.wildcardMask} />
                  <ResultRow label="CIDR notation" value={result.cidrNotation} />
                  <ResultRow label="First usable host" value={result.firstUsableHost} />
                  <ResultRow label="Last usable host" value={result.lastUsableHost} />
                  <ResultRow label="Total addresses" value={result.totalAddresses} />
                  <ResultRow label="Usable hosts" value={result.usableHostCount} />
                  <ResultRow label="Usable range" value={result.usableRange} />
                  <ResultRow label="IP binary" value={result.ipBinary} />
                  <ResultRow label="Mask binary" value={result.subnetMaskBinary} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Visualizations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BinaryBar result={result} />
                  <AddressRangeBar result={result} />
                  <p className="text-xs text-muted-foreground">
                    Legacy class ({result.legacyClass}) is shown for reference. Modern networks use classless CIDR subnetting.
                  </p>
                  {result.isPointToPoint && (
                    <p className="text-xs text-amber-400/90">
                      /31 point-to-point links (RFC 3021): both addresses are usable; traditional network/broadcast reservation does not apply.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {tab === "splitter" && (
        <>
          <div className="flex gap-2 flex-wrap">
            <div>
              <Label>Base network</Label>
              <Input value={splitBase} onChange={(e) => setSplitBase(e.target.value)} />
            </div>
            <div>
              <Label>New prefix</Label>
              <Input value={splitPrefix} onChange={(e) => setSplitPrefix(e.target.value)} type="number" min={1} max={32} />
            </div>
            <div className="flex items-end">
              <Button onClick={doSplit}>Split</Button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          {splitResult && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2">Network</th>
                    <th className="text-left py-2">First host</th>
                    <th className="text-left py-2">Last host</th>
                    <th className="text-left py-2">Broadcast</th>
                    <th className="text-left py-2">Usable</th>
                  </tr>
                </thead>
                <tbody>
                  {splitResult.map((s) => (
                    <tr key={s.cidrNotation} className="border-b border-border/50 font-mono">
                      <td className="py-1.5">{s.cidrNotation}</td>
                      <td className="py-1.5">{s.firstUsableHost ?? "—"}</td>
                      <td className="py-1.5">{s.lastUsableHost ?? "—"}</td>
                      <td className="py-1.5">{s.broadcastAddress}</td>
                      <td className="py-1.5">{s.usableHostCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function QuickCidrWidget() {
  const [input, setInput] = useState("192.168.1.10/24");
  const result = calculateCidr(input);

  return (
    <div className="space-y-2">
      <Input value={input} onChange={(e) => setInput(e.target.value)} aria-label="Quick CIDR input" />
      {"isValid" in result && result.isValid === false ? (
        <p className="text-xs text-destructive">{result.message}</p>
      ) : result.isValid ? (
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div><span className="text-muted-foreground">Network:</span> {result.networkAddress}</div>
          <div><span className="text-muted-foreground">Broadcast:</span> {result.broadcastAddress}</div>
          <div><span className="text-muted-foreground">Mask:</span> {result.subnetMask}</div>
          <div><span className="text-muted-foreground">Hosts:</span> {result.usableHostCount}</div>
        </div>
      ) : null}
    </div>
  );
}
