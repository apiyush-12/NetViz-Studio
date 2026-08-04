import type { LearningTopic } from "@/data/learning-content";

export const loadBalancerTopic: LearningTopic = {
  id: "load-balancer",
  title: "Load Balancer",
  subtitle: "Network device or reverse proxy that distributes incoming traffic across a pool of backend servers",
  category: "services",
  readTime: "8 min",
  summary:
    "A load balancer is a physical or virtual network appliance that sits in front of a pool of backend application servers. It acts as a reverse proxy, distributing incoming client requests evenly to maximize throughput, minimize response latency, and ensure high availability.",
  keyTakeaways: [
    "Distributes incoming application traffic across multiple backend servers.",
    "Performs periodic Health Checks to automatically remove failed servers from rotation.",
    "Layer 4 Load Balancers route based on IP addresses and TCP/UDP ports.",
    "Layer 7 Load Balancers route based on application data (URLs, HTTP headers, cookies).",
    "Uses balancing algorithms like Round Robin, Least Connections, and Weighted Distribution.",
    "Improves system availability, fault tolerance, and horizontal scaling.",
  ],
  diagram: {
    title: "Load Balancer Topology & Layer 4 vs Layer 7 Comparison",
    textRepresentation: `Load Balancer Architecture:
                             ┌──► Backend Server 1 (10.0.0.11)
                             │
Client Requests ──► [ LOAD BALANCER ] ──► Backend Server 2 (10.0.0.12)
(Public VIP)                 │
                             └──► Backend Server 3 (10.0.0.13)`,
  },
  importantTerms: [
    { term: "VIP (Virtual IP Address)", definition: "The public IP address exposed by the load balancer that clients connect to." },
    { term: "Backend Server Pool", definition: "The farm of internal application servers receiving distributed traffic." },
    { term: "Health Check", definition: "Periodic synthetic probes (e.g. GET /health) sent by the load balancer to verify backend server status." },
    { term: "Session Persistence (Sticky Sessions)", definition: "Directing a specific client's subsequent requests to the exact same backend server." },
    { term: "Reverse Proxy", definition: "An intermediate server that accepts requests from external clients and forwards them to internal servers." },
  ],
  sections: [
    {
      id: "why-load-balancer-needed",
      title: "Why Load Balancers Are Needed",
      body: "A single web server can only handle a limited number of simultaneous HTTP connections before CPU, RAM, or bandwidth is exhausted. Load balancers enable horizontal scaling, allowing web applications to scale seamlessly across dozens of servers.",
    },
    {
      id: "how-load-balancer-works-algorithms",
      title: "How Load Balancing Algorithms Work",
      body: "Load balancers distribute traffic using specific distribution algorithms:",
      bullets: [
        "Round Robin: Rotates requests sequentially across all servers (Server 1 -> Server 2 -> Server 3 -> Server 1).",
        "Least Connections: Sends new requests to whichever server currently has the fewest active TCP connections.",
        "Weighted Distribution: Sends more traffic to high-capacity servers based on assigned weight ratios.",
        "IP Hash: Computes a hash of the client IP to consistently map clients to specific servers.",
      ],
    },
    {
      id: "layer4-vs-layer7",
      title: "Layer 4 vs Layer 7 Load Balancing",
      body: "Understanding the difference between transport-level and application-aware load balancing:",
      bullets: [
        "Layer 4 Load Balancer: Operates at Transport Layer (IP + Port). Fast and lightweight because it does not inspect HTTP payload.",
        "Layer 7 Load Balancer: Operates at Application Layer (HTTP/HTTPS). Inspects URL paths (e.g. /api vs /static), HTTP headers, and cookies to perform intelligent routing.",
      ],
    },
  ],
  advantages: [
    "High Availability — automatically reroutes traffic away from failed backend servers.",
    "Horizontal Scalability — add or remove backend servers without downtime.",
    "SSL/TLS Offloading — decrypts TLS traffic at the load balancer, relieving CPU load on backend servers.",
  ],
  disadvantages: [
    "Adds an extra network hop and potential single point of failure if load balancers are not deployed in HA pairs.",
    "Requires managing session persistence for stateful applications.",
  ],
  commonUseCases: [
    "Distributing web traffic across cloud server instances (e.g. AWS ALB / NGINX).",
    "Microservice API routing based on URL path prefixes (/users vs /orders).",
  ],
  commonMistakes: [
    "Confusing a Load Balancer with a Router — routers connect different IP subnets; load balancers distribute traffic across a pool of servers.",
    "Forgetting session sticky settings on stateful web apps — causes users to lose login sessions if requests bounce between different backend servers.",
  ],
  comparison: {
    headers: ["Aspect", "Layer 4 Load Balancer", "Layer 7 Load Balancer"],
    rows: [
      { label: "Inspection Depth", classful: "Transport info (IP Address & TCP/UDP Port)", cidr: "Application info (URL, HTTP Headers, Cookies)" },
      { label: "Performance / Speed", classful: "Ultra-fast (Low CPU overhead)", cidr: "Slightly slower (Requires HTTP parsing)" },
      { label: "Routing Capability", classful: "Basic packet distribution per IP/Port", cidr: "Advanced URL path & cookie-based routing" },
      { label: "TLS Offloading", classful: "Passes encrypted TCP streams through", cidr: "Decrypts TLS to inspect HTTP headers" },
    ],
  },
  beginnerSummary:
    "A load balancer is like a host at a busy restaurant. When customers arrive, the load balancer directs each guest to an open table, making sure no single waiter gets overwhelmed and ensuring service continues smoothly even if one waiter goes on break.",
  relatedLinks: [
    { label: "HTTP", href: "/learn/http" },
    { label: "HTTPS", href: "/learn/https" },
    { label: "TCP", href: "/learn/tcp" },
    { label: "Firewall", href: "/learn/firewall" },
  ],
};
