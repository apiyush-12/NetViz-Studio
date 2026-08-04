import type { LearningTopic } from "@/data/learning-content";

export const httpTopic: LearningTopic = {
  id: "http",
  title: "HTTP",
  subtitle: "Hypertext Transfer Protocol — Application layer protocol for transferring web resources (TCP Port 80)",
  category: "services",
  readTime: "7 min",
  summary:
    "HTTP (Hypertext Transfer Protocol, RFC 2616 / RFC 9110) is the foundation of the World Wide Web. Operating at Layer 7 over TCP port 80, HTTP uses a client-server model to transfer HTML documents, images, scripts, and API payloads.",
  keyTakeaways: [
    "Operates at Layer 7 (Application Layer) over TCP port 80 by default.",
    "Follows a Client-Server request-response architecture.",
    "Stateless protocol: Every HTTP request is executed independently without inherent memory of previous requests.",
    "Uses standard Request Methods: GET, POST, PUT, PATCH, DELETE.",
    "Uses HTTP Status Codes (200 OK, 404 Not Found, 500 Server Error) to communicate response outcomes.",
    "Note: HTTP/1.1 uses plain text headers; HTTP/2 and HTTP/3 serialize frames into optimized binary streams.",
  ],
  diagram: {
    title: "HTTP Client-Server Flow & Plaintext Message Examples",
    textRepresentation: `HTTP Request / Response Flow:
Client (Browser) ─── Plain HTTP Request (Port 80) ───► Web Server
Client (Browser) ◄─── Plain HTTP Response ─────────── Web Server

HTTP/1.1 Plaintext Request Example:
GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: text/html

HTTP/1.1 Plaintext Response Example:
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 125

<html><body><h1>Hello World</h1></body></html>`,
  },
  importantTerms: [
    { term: "HTTP Request", definition: "Message sent by a client (browser) asking a server for a resource or submitting data." },
    { term: "HTTP Response", definition: "Message returned by a server containing status code, response headers, and requested body payload." },
    { term: "HTTP Method", definition: "Verbs defining the intended action: GET (fetch), POST (create), PUT (replace), DELETE (remove)." },
    { term: "Status Code", definition: "3-digit numerical code: 2xx (Success), 3xx (Redirection), 4xx (Client Error), 5xx (Server Error)." },
    { term: "Statelessness", definition: "Each request is isolated; state is maintained externally via Cookies or Web Tokens." },
    { term: "Cookie", definition: "Small key-value data sent by a server and stored by the browser to track user session state." },
  ],
  sections: [
    {
      id: "why-http-needed",
      title: "Why HTTP is Needed",
      body: "Before HTTP, accessing files across remote computers required complex command-line utilities. HTTP established a standardized format for requesting web pages via URLs and linking documents using hyperlinks.",
    },
    {
      id: "how-http-works",
      title: "How HTTP Works: Methods & Status Codes",
      body: "An HTTP transaction consists of two parts:",
      bullets: [
        "1. Request: Client opens a TCP connection to Port 80 and sends a request line (e.g. GET /index.html HTTP/1.1), headers, and optional body.",
        "2. Response: Server processes the request and returns a status line (e.g. HTTP/1.1 200 OK), headers (Content-Type), and payload bytes.",
        "3. HTTP Methods: GET (reads data), POST (submits form data), PUT (overwrites resource), DELETE (removes resource).",
        "4. Status Codes: 200 OK (success), 301 Moved Permanently (redirect), 404 Not Found (missing resource), 500 Internal Server Error.",
      ],
    },
    {
      id: "http-versions-evolution",
      title: "HTTP Version Evolution",
      body: "HTTP has evolved to optimize network performance:",
      bullets: [
        "HTTP/1.1 (Text): Persistent TCP connections, but suffers from head-of-line blocking.",
        "HTTP/2 (Binary): Multiplexes multiple requests simultaneously over a single TCP connection.",
        "HTTP/3 (QUIC): Operates over UDP to eliminate TCP head-of-line blocking and speed up handshakes.",
      ],
    },
  ],
  advantages: [
    "Simple, extensible, human-readable text format (HTTP/1.1).",
    "Universal adoption across all web browsers, operating systems, and IoT devices.",
    "Easily cached by browser caches and Content Delivery Networks (CDNs).",
  ],
  disadvantages: [
    "Unencrypted — plain text headers and body can be snooped or tampered with on public networks (fixed by HTTPS).",
    "Stateless nature requires managing cookies for user login sessions.",
  ],
  commonUseCases: [
    "Serving legacy internal web pages, API endpoints, and web microservices.",
  ],
  commonMistakes: [
    "Using unencrypted HTTP for login forms or sensitive payment data — credentials can be stolen over public Wi-Fi.",
    "Assuming all HTTP requests look like HTTP/1.1 text strings — modern HTTP/2 and HTTP/3 format requests into binary frame streams.",
  ],
  comparison: {
    headers: ["Aspect", "HTTP (Plaintext)", "HTTPS (Secure)"],
    rows: [
      { label: "Default Port", classful: "Port 80", cidr: "Port 443" },
      { label: "Encryption", classful: "None (Plain text payload)", cidr: "TLS Encrypted Payload & Headers" },
      { label: "Security Pillar", classful: "Vulnerable to eavesdropping & tampering", cidr: "Confidentiality, Integrity, Authentication" },
      { label: "Browser Indicator", classful: "Warns 'Not Secure' in address bar", cidr: "Displays padlock icon" },
    ],
  },
  beginnerSummary:
    "HTTP is the language your web browser uses to talk to web servers. When you click a link, your browser sends an HTTP GET request asking for a web page, and the server replies back with the HTML code to render the page.",
  relatedLinks: [
    { label: "HTTPS", href: "/learn/https" },
    { label: "TCP", href: "/learn/tcp" },
    { label: "Ports", href: "/learn/ports" },
    { label: "DNS", href: "/learn/dns" },
  ],
};
