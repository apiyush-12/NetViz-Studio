# NetViz Studio

> An interactive network visualization and learning platform for exploring packet flow, protocol behavior, subnetting, topology design, and hands-on networking labs.

<p align="center">
  <strong>Visualize. Configure. Simulate. Understand.</strong>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Current Status](#current-status)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Using the Platform](#using-the-platform)
- [Authentication](#authentication)
- [Protocol Module Architecture](#protocol-module-architecture)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Educational Scope](#educational-scope)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Contact](#contact)

---

## Overview

**NetViz Studio** is a browser-based network visualization platform designed to make networking concepts easier to understand through interactive simulations.

Instead of learning only from static diagrams, users can observe packets moving between devices, inspect protocol fields, pause and replay events, introduce failures, configure network settings, and understand why each networking decision occurs.

The platform is designed for:

- Networking and computer-science students
- CCNA and certification learners
- Developers learning networking fundamentals
- Instructors demonstrating protocol behavior
- IT professionals revising core networking concepts
- Beginners who prefer visual and hands-on learning

---

## Current Status

The project is under active development.

| Module | Status |
|---|---|
| Authentication | Available |
| TCP Visualizer | Available |
| UDP Visualizer | Available |
| Shared Simulation Controls | Available / evolving |
| Packet Flow Animation | Available / evolving |
| CIDR and Subnetting Studio | Planned or in progress |
| Topology Builder | Planned or in progress |
| Interactive Labs | Planned or in progress |
| ARP | Planned |
| ICMP | Planned |
| DHCP | Planned |
| DNS | Planned |
| OSPF | Planned |
| BGP | Planned |
| VLAN and STP | Planned |
| IPv6 and NDP | Planned |

> Update this table whenever a module becomes production-ready.

---

## Features

### Protocol Visualization

Explore networking protocols through step-by-step animations and structured events.

Currently available:

- TCP packet flow
- TCP acknowledgements
- TCP connection behavior
- TCP packet-loss and retransmission concepts
- UDP datagram flow
- UDP packet-loss behavior
- TCP and UDP comparison

Planned protocol modules include:

- ARP
- ICMP
- DHCP
- DNS
- HTTP and HTTPS
- TLS
- NAT and PAT
- RIP
- OSPF
- BGP
- Ethernet switching
- VLAN
- STP
- IPv4 forwarding
- IPv6 and Neighbor Discovery

### Simulation Controls

- Play
- Pause
- Resume
- Restart
- Previous step
- Next step
- Adjustable simulation speed
- Packet-loss configuration
- Event timeline
- Packet selection and inspection
- Step-by-step explanations

### CIDR and Subnetting

The planned CIDR Studio will provide:

- IPv4 and CIDR validation
- Network address
- Broadcast address
- First and last usable addresses
- Total address count
- Traditional usable-host count
- Subnet mask
- Wildcard mask
- Network and host bits
- Legacy IP class display
- Binary representation
- Subnet splitting
- VLSM planning
- Supernetting
- Subnet-membership checking

### Network Topology Builder

The planned topology workspace will allow users to:

- Drag and drop hosts, switches, routers, servers, and firewalls
- Connect device interfaces
- Assign IP and MAC addresses
- Configure gateways and routes
- Configure link cost, latency, bandwidth, and packet loss
- Validate network configuration
- Send ping, traceroute, TCP, UDP, DNS, and HTTP traffic
- Observe packet paths through the actual topology
- Save and reload topologies

### Interactive Labs

The planned Labs section will include:

- Guided configuration labs
- Protocol observation labs
- Prediction exercises
- Troubleshooting challenges
- Automatic task validation
- Progressive hints
- Saved progress
- Completion results
- Learning paths
- Beginner, intermediate, and advanced activities

### Authentication and User Accounts

Authenticated users can be supported with:

- Secure registration and login
- Session management
- Saved topologies
- Saved simulation presets
- Lab progress
- Learning history
- User preferences
- Recently opened modules
- Personalized dashboard

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Framer Motion

### Visualization

- React Flow
- SVG
- Recharts

### State and Validation

- Zustand
- React Hook Form
- Zod
- LocalStorage
- JSON

### Backend and Data

- Node.js
- Next.js server routes or REST APIs
- PostgreSQL
- Prisma ORM

### Authentication

Depending on the current implementation:

- Session-based authentication
- JWT
- OAuth
- bcrypt
- Secure cookies

### Testing and Quality

- Vitest
- React Testing Library
- Playwright
- ESLint
- Prettier

### Development and Deployment

- npm
- Git
- GitHub
- Docker
- Vercel

> Remove technologies that are not used in the actual repository.

---

## Architecture

NetViz Studio follows a modular architecture so that new protocols, labs, and visual tools can be added without rewriting the entire platform.

```mermaid
flowchart TD
    UI[User Interface] --> STATE[Application State]
    UI --> AUTH[Authentication]
    UI --> SIM[Simulation Engine]
    UI --> TOPO[Topology Engine]
    UI --> LABS[Lab Engine]
    UI --> CIDR[CIDR Utilities]

    SIM --> REGISTRY[Protocol Registry]
    REGISTRY --> TCP[TCP Module]
    REGISTRY --> UDP[UDP Module]
    REGISTRY --> FUTURE[Future Protocol Modules]

    TOPO --> FORWARD[Forwarding Engine]
    TOPO --> VALIDATE[Validation Engine]

    LABS --> VALIDATE
    LABS --> SIM
    LABS --> TOPO

    AUTH --> API[Server/API Layer]
    API --> DB[(PostgreSQL)]
```

### Architectural Principles

- Protocol logic is separated from UI components.
- Packet animation is driven by simulation events.
- CIDR calculations use tested utility functions.
- Topology state is independent from visual rendering.
- Lab validation reads real simulation and topology state.
- Authentication reuses one centralized session system.
- New protocols are registered through a common interface.
- Educational simplifications are documented clearly.

---

## Project Structure

A recommended project structure is shown below. Adjust it to match the actual repository.

```text
netviz-studio/
├── public/
│   ├── icons/
│   ├── illustrations/
│   └── screenshots/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── protocols/
│   │   │   ├── page.tsx
│   │   │   ├── tcp/
│   │   │   ├── udp/
│   │   │   └── [protocolId]/
│   │   ├── cidr/
│   │   ├── topology/
│   │   ├── labs/
│   │   ├── login/
│   │   ├── register/
│   │   ├── settings/
│   │   └── api/
│   │
│   ├── components/
│   │   ├── landing/
│   │   ├── layout/
│   │   ├── auth/
│   │   ├── simulation/
│   │   ├── protocols/
│   │   ├── topology/
│   │   ├── cidr/
│   │   ├── labs/
│   │   └── ui/
│   │
│   ├── features/
│   │   ├── simulation/
│   │   ├── protocols/
│   │   │   ├── tcp/
│   │   │   ├── udp/
│   │   │   └── registry.ts
│   │   ├── topology/
│   │   ├── forwarding/
│   │   ├── addressing/
│   │   ├── labs/
│   │   └── auth/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   ├── data/
│   ├── types/
│   └── tests/
│
├── docs/
│   ├── architecture.md
│   ├── simulation-engine.md
│   ├── protocol-module-guide.md
│   ├── networking-assumptions.md
│   └── contributing.md
│
├── .env.example
├── .eslintrc.json
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js 20 or later
- npm 10 or later
- Git
- PostgreSQL, if database-backed features are enabled

Optional:

- Docker and Docker Compose
- A configured OAuth application
- Vercel CLI

### 1. Clone the Repository

```bash
git clone https://github.com/apiyush-12/NetViz-Studio
cd netviz-studio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create the Environment File

```bash
cp .env.example .env.local
```

Update `.env.local` with the values required by your authentication and database implementation.

### 4. Prepare the Database

When Prisma and PostgreSQL are enabled:

```bash
npx prisma generate
npx prisma migrate dev
```

Optional database viewer:

```bash
npx prisma studio
```

### 5. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 6. Create a Production Build

```bash
npm run build
npm run start
```

---

## Environment Variables

The exact variables depend on the authentication provider and deployment setup.

Example:

```env
# Application
NEXT_PUBLIC_APP_NAME="NetViz Studio"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/netviz_studio"

# Authentication
AUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Optional OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""

# Optional analytics
NEXT_PUBLIC_ANALYTICS_ID=""
```

Generate a secure secret using a trusted secret-generation method.

Never commit `.env.local`, production credentials, tokens, or private keys.

---

## Available Scripts

The script names may vary depending on the repository.

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format files with Prettier |
| `npm run typecheck` | Run TypeScript checks |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Apply development migrations |
| `npm run prisma:studio` | Open Prisma Studio |

---

## Using the Platform

### Explore TCP

1. Open the TCP visualizer.
2. Configure packet count, delay, packet loss, and other supported options.
3. Start the simulation.
4. Observe packets and acknowledgements.
5. Pause or move step by step.
6. Select an event or packet to inspect its details.
7. Restart the simulation with different settings.

### Explore UDP

1. Open the UDP visualizer.
2. Configure datagram count and delivery conditions.
3. Start the simulation.
4. Observe connectionless delivery.
5. Introduce packet loss.
6. Compare the result with TCP behavior.

### Compare TCP and UDP

| TCP | UDP |
|---|---|
| Connection-oriented | Connectionless |
| Uses sequence and acknowledgement behavior | No native acknowledgement |
| Supports retransmission behavior | No native retransmission |
| Higher protocol overhead | Lower protocol overhead |
| Suitable for reliable delivery | Suitable for low-latency delivery |

### Save Your Progress

When authenticated:

1. Log in or create an account.
2. Open a supported simulation, topology, or lab.
3. Use the Save action.
4. Access saved content from the dashboard.

---

## Authentication

The landing page and public tools can remain accessible without an account.

Authentication should be required only for protected actions such as:

- Saving a topology
- Saving a simulation preset
- Resuming a lab
- Tracking learning progress
- Opening personalized history
- Updating account settings

### Recommended Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Application
    participant P as Auth Provider
    participant D as Database

    U->>A: Open protected action
    A->>U: Request login
    U->>P: Submit credentials or OAuth
    P-->>A: Verified session
    A->>D: Load user data
    D-->>A: Saved progress and settings
    A-->>U: Continue to intended destination
```

### Security Requirements

- Hash passwords securely.
- Use secure, HTTP-only cookies where applicable.
- Validate all authentication input.
- Protect private routes on the server.
- Prevent open redirects.
- Do not expose session tokens to client logs.
- Rate-limit sensitive authentication actions.
- Never store plain-text passwords.

---

## Protocol Module Architecture

Each protocol should be implemented as an independent module.

Example interface:

```ts
interface ProtocolModule<TConfig = unknown> {
  id: string;
  name: string;
  shortName: string;
  category: string;
  layer: string;
  summary: string;
  learningObjectives: string[];
  defaultConfiguration: TConfig;
  generateSimulation: (
    configuration: TConfig
  ) => SimulationEvent[];
}
```

Example registry:

```ts
import { tcpProtocolModule } from "./tcp/tcp.module";
import { udpProtocolModule } from "./udp/udp.module";

export const protocolRegistry = {
  tcp: tcpProtocolModule,
  udp: udpProtocolModule,
};
```

### Adding a New Protocol

1. Create a new folder in `src/features/protocols/`.
2. Define protocol-specific types.
3. Add a validated configuration schema.
4. Implement packet and event generation.
5. Add explanations and learning objectives.
6. Add protocol-specific UI components.
7. Register the module in the protocol registry.
8. Add tests.
9. Document educational simplifications.

Suggested module files:

```text
src/features/protocols/arp/
├── arp.module.ts
├── arp.types.ts
├── arp.schema.ts
├── arp.defaults.ts
├── arp.simulator.ts
├── arp.packet-builder.ts
├── arp.explanations.ts
└── arp.test.ts
```

---

## Testing

### Unit Tests

Use unit tests for:

- CIDR calculations
- IP address parsing
- Packet generation
- Protocol event ordering
- TCP and UDP state behavior
- Route selection
- Topology validation
- Lab validators
- Authentication utilities

Run:

```bash
npm run test
```

### Component Tests

Use React Testing Library for:

- Forms
- Protocol controls
- Packet inspector
- Timeline interactions
- Authentication states
- Lab tasks
- Topology configuration panels

### End-to-End Tests

Use Playwright for:

- Registration and login
- TCP simulation
- UDP simulation
- Packet-loss scenarios
- CIDR calculation
- Topology save and load
- Lab progress
- Authentication redirects

Run:

```bash
npm run test:e2e
```

### Recommended Quality Check

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

---

## Roadmap

### Phase 1 — Core Platform

- [x] Authentication
- [x] TCP visualization
- [x] UDP visualization
- [ ] Shared packet inspector
- [ ] Improved event timeline
- [ ] Simulation presets
- [ ] Responsive refinements

### Phase 2 — Addressing and Core Network Behavior

- [ ] CIDR calculator
- [ ] Binary subnet visualization
- [ ] Subnet splitting
- [ ] VLSM
- [ ] ARP
- [ ] ICMP
- [ ] IPv4 forwarding

### Phase 3 — Network Services

- [ ] DHCP
- [ ] DNS
- [ ] HTTP
- [ ] HTTPS and simplified TLS
- [ ] NAT and PAT
- [ ] Firewall rules

### Phase 4 — Topology Builder

- [ ] Drag-and-drop devices
- [ ] Interface configuration
- [ ] Link configuration
- [ ] Static routes
- [ ] Packet path calculation
- [ ] Failure injection
- [ ] Import and export

### Phase 5 — Routing and Switching

- [ ] Ethernet switching
- [ ] VLAN
- [ ] STP
- [ ] RIP
- [ ] OSPF
- [ ] BGP

### Phase 6 — Labs and Learning

- [ ] Guided labs
- [ ] Prediction exercises
- [ ] Troubleshooting labs
- [ ] Automatic validation
- [ ] Progressive hints
- [ ] Progress analytics
- [ ] Custom lab authoring

### Future Ideas

- [ ] IPv6 and Neighbor Discovery
- [ ] QUIC
- [ ] MPLS
- [ ] GRE
- [ ] IPsec
- [ ] SNMP
- [ ] NTP
- [ ] SSH
- [ ] Collaborative simulations
- [ ] Instructor-led sessions
- [ ] Packet-capture import
- [ ] Shareable simulation links

---

## Educational Scope

NetViz Studio is primarily an educational visualization and simulation platform.

It is not intended to replace:

- Physical networking equipment
- Full vendor-specific network emulators
- Production packet-capture tools
- Enterprise network-management systems
- RFC conformance test suites

Some protocol behavior may be simplified to make it easier to understand. Every simplified module should document:

- What is accurately represented
- What is simplified
- What is intentionally omitted
- Which behaviors may vary by operating system or vendor

Important examples:

- UDP does not provide native acknowledgements or retransmission.
- ARP is used for IPv4 address resolution on a local Layer 2 network.
- IPv6 uses Neighbor Discovery rather than ARP.
- Classful addressing is a legacy concept; modern subnetting uses CIDR.
- OSPF and BGP educational models may omit advanced implementation details.
- Packet timing in the visualizer is illustrative rather than hardware-accurate.

---

## Contributing

Contributions are welcome.

### Contribution Workflow

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/arp-visualizer
```

3. Make focused changes.
4. Add or update tests.
5. Run quality checks.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

6. Commit your changes.

```bash
git commit -m "feat: add ARP cache-miss simulation"
```

7. Push the branch.

```bash
git push origin feature/arp-visualizer
```

8. Open a pull request.

### Commit Convention

Recommended examples:

```text
feat: add UDP packet-loss control
fix: correct TCP acknowledgement sequence
docs: update protocol module guide
test: add CIDR edge-case coverage
refactor: separate packet animation from protocol logic
chore: update dependencies
```

### Pull Request Expectations

- Explain the problem and solution.
- Keep changes focused.
- Include screenshots for UI changes.
- Include tests for networking logic.
- Document educational simplifications.
- Avoid mixing unrelated refactors with feature work.

---

## Security

Please do not publicly disclose security vulnerabilities through regular issues.

Report sensitive problems privately to the project maintainer.

Include:

- A clear description
- Reproduction steps
- Potential impact
- Suggested remediation, when available

Never include:

- Real passwords
- Access tokens
- Private keys
- Production database credentials
- Private user data

---

## License

Add the selected license before public distribution.

Example:

```text
MIT License
```

Replace this section with the complete license notice or link to the `LICENSE` file.

---

## Contact

**Project:** NetViz Studio  
**Maintainer:** `Piyush Kumar`  
**Repository:** `https://github.com/apiyush-12/NetViz-Studio`  
**Demo:** `netviz.piyussh.dev`  
**Email:** `apiyushkumar2000@gmail.com`

---

<p align="center">
  Built to make networking visible, interactive, and easier to understand.
</p>
