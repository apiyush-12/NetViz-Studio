import { NetworkTopology } from "@/features/topology/topology-types";

export interface HttpSimulationResult {
  success: boolean;
  statusCode: number;
  responseBody: string;
  explanation: string;
  events: Array<{
    step: number;
    summary: string;
    explanation: string;
    protocol: "TCP" | "HTTP" | "HTTPS";
    sourceNodeId: string;
    destNodeId: string;
  }>;
}

export function runHttpSimulation(
  topology: NetworkTopology,
  clientNodeId: string,
  serverNodeId: string,
  path: string = "/",
  useHttps: boolean = false
): HttpSimulationResult {
  const clientNode = topology.nodes.find((n) => n.id === clientNodeId);
  const serverNode = topology.nodes.find((n) => n.id === serverNodeId);

  if (!clientNode || !serverNode) {
    return {
      success: false,
      statusCode: 500,
      responseBody: "Internal Error: Client or Server node not found",
      explanation: "Client or Server device missing.",
      events: [],
    };
  }

  const httpConfig = serverNode.protocolConfiguration.http;
  const port = useHttps ? 443 : httpConfig?.port || 80;
  const statusCode = httpConfig?.responseStatus || 200;
  const responseBody = httpConfig?.responseBody || "<html><body><h1>200 OK</h1></body></html>";

  const events: HttpSimulationResult["events"] = [
    // 1. TCP Handshake
    {
      step: 1,
      summary: `TCP [SYN] Port ${port}`,
      explanation: `Client ${clientNode.name} sends TCP SYN packet to initiate connection with ${serverNode.name} on port ${port}.`,
      protocol: "TCP",
      sourceNodeId: clientNode.id,
      destNodeId: serverNode.id,
    },
    {
      step: 2,
      summary: `TCP [SYN, ACK] Port ${port}`,
      explanation: `Web Server ${serverNode.name} acknowledges SYN with TCP [SYN, ACK].`,
      protocol: "TCP",
      sourceNodeId: serverNode.id,
      destNodeId: clientNode.id,
    },
    {
      step: 3,
      summary: `TCP [ACK] Port ${port}`,
      explanation: `Client ${clientNode.name} sends final ACK. TCP 3-way handshake established.`,
      protocol: "TCP",
      sourceNodeId: clientNode.id,
      destNodeId: serverNode.id,
    },
  ];

  if (useHttps) {
    events.push({
      step: 4,
      summary: "TLS ClientHello / ServerHello & Key Exchange (HTTPS)",
      explanation: "Negotiation of TLS cipher suites, certificate validation, and symmetric encryption keys establishment.",
      protocol: "HTTPS",
      sourceNodeId: clientNode.id,
      destNodeId: serverNode.id,
    });
  }

  events.push(
    {
      step: useHttps ? 5 : 4,
      summary: `${useHttps ? "HTTPS" : "HTTP"} GET ${path} HTTP/1.1`,
      explanation: `Client ${clientNode.name} sends HTTP GET request over ${useHttps ? "TLS encrypted tunnel" : "plaintext TCP"}.`,
      protocol: useHttps ? "HTTPS" : "HTTP",
      sourceNodeId: clientNode.id,
      destNodeId: serverNode.id,
    },
    {
      step: useHttps ? 6 : 5,
      summary: `HTTP/1.1 ${statusCode} OK (Content-Length: ${responseBody.length})`,
      explanation: `Web Server ${serverNode.name} returns HTTP ${statusCode} response payload to ${clientNode.name}.`,
      protocol: useHttps ? "HTTPS" : "HTTP",
      sourceNodeId: serverNode.id,
      destNodeId: clientNode.id,
    }
  );

  return {
    success: statusCode < 400,
    statusCode,
    responseBody,
    explanation: `HTTP GET ${path} succeeded. Server ${serverNode.name} responded with status ${statusCode} OK.`,
    events,
  };
}
