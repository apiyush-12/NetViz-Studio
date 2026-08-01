export function exportAsJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function exportSubnetListCsv(
  subnets: Array<{
    cidrNotation: string;
    networkAddress: string;
    firstUsableHost: string | null;
    lastUsableHost: string | null;
    broadcastAddress: string;
    usableHostCount: string;
  }>
): string {
  const header = "CIDR,Network,First Host,Last Host,Broadcast,Usable Hosts";
  const rows = subnets.map(
    (s) =>
      `${s.cidrNotation},${s.networkAddress},${s.firstUsableHost ?? ""},${s.lastUsableHost ?? ""},${s.broadcastAddress},${s.usableHostCount}`
  );
  return [header, ...rows].join("\n");
}

export function downloadTextFile(content: string, filename: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
