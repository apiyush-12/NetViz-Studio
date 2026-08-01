import { DeviceCategory, NetworkNodeType, InterfaceType } from "@/features/topology/topology-types";

export interface DeviceCatalogItem {
  type: NetworkNodeType;
  name: string;
  category: DeviceCategory;
  description: string;
  iconName: string;
  defaultInterfaces: Array<{
    name: string;
    type: InterfaceType;
    mtu?: number;
  }>;
  defaultServices?: {
    dhcp?: boolean;
    dns?: boolean;
    http?: boolean;
  };
}

export const DEVICE_CATALOG: DeviceCatalogItem[] = [
  // End Devices
  {
    type: "pc",
    name: "Desktop PC",
    category: "end-device",
    description: "Standard desktop workstation node with a single Ethernet interface.",
    iconName: "Monitor",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },
  {
    type: "laptop",
    name: "Laptop",
    category: "end-device",
    description: "Portable user terminal with Ethernet and Wireless connectivity.",
    iconName: "Laptop",
    defaultInterfaces: [
      { name: "eth0", type: "ethernet" },
      { name: "wlan0", type: "wireless" },
    ],
  },
  {
    type: "mobile",
    name: "Mobile Device",
    category: "end-device",
    description: "Smartphone or tablet connecting via Wi-Fi wireless interface.",
    iconName: "Smartphone",
    defaultInterfaces: [{ name: "wlan0", type: "wireless" }],
  },
  {
    type: "host",
    name: "Generic Host",
    category: "end-device",
    description: "General endpoint host suitable for custom scripts and traffic testing.",
    iconName: "HardDrive",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },
  {
    type: "printer",
    name: "Network Printer",
    category: "end-device",
    description: "Networked office printer with static IP configuration.",
    iconName: "Printer",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },

  // Network Devices
  {
    type: "l2-switch",
    name: "Layer 2 Switch",
    category: "network-device",
    description: "Multi-port Layer 2 Ethernet switch supporting MAC learning and VLANs.",
    iconName: "Network",
    defaultInterfaces: [
      { name: "GigabitEthernet0/1", type: "gigabit" },
      { name: "GigabitEthernet0/2", type: "gigabit" },
      { name: "GigabitEthernet0/3", type: "gigabit" },
      { name: "GigabitEthernet0/4", type: "gigabit" },
    ],
  },
  {
    type: "l3-switch",
    name: "Layer 3 Switch",
    category: "network-device",
    description: "High-performance multilayer switch supporting VLAN routing and static routes.",
    iconName: "Layers",
    defaultInterfaces: [
      { name: "GigabitEthernet0/1", type: "gigabit" },
      { name: "GigabitEthernet0/2", type: "gigabit" },
      { name: "GigabitEthernet0/3", type: "gigabit" },
      { name: "GigabitEthernet0/4", type: "gigabit" },
      { name: "Vlan1", type: "vlan" },
    ],
  },
  {
    type: "router",
    name: "Router",
    category: "network-device",
    description: "Layer 3 forwarding router supporting static routes, OSPF, and BGP routing.",
    iconName: "Router",
    defaultInterfaces: [
      { name: "GigabitEthernet0/0", type: "gigabit" },
      { name: "GigabitEthernet0/1", type: "gigabit" },
      { name: "Serial0/0/0", type: "serial" },
      { name: "Loopback0", type: "loopback" },
    ],
  },
  {
    type: "access-point",
    name: "Wireless Access Point",
    category: "network-device",
    description: "Wi-Fi access point bridging wireless hosts to wired Ethernet switches.",
    iconName: "Wifi",
    defaultInterfaces: [
      { name: "eth0", type: "ethernet" },
      { name: "wlan0", type: "wireless" },
    ],
  },
  {
    type: "firewall",
    name: "Firewall",
    category: "network-device",
    description: "Stateful packet filter enforcing security access control rules.",
    iconName: "Shield",
    defaultInterfaces: [
      { name: "GigabitEthernet0/0", type: "gigabit" }, // Outside
      { name: "GigabitEthernet0/1", type: "gigabit" }, // Inside
      { name: "GigabitEthernet0/2", type: "gigabit" }, // DMZ
    ],
  },
  {
    type: "load-balancer",
    name: "Load Balancer",
    category: "network-device",
    description: "Distributes incoming TCP/HTTP application traffic across backend servers.",
    iconName: "Scale",
    defaultInterfaces: [
      { name: "eth0", type: "ethernet" },
      { name: "eth1", type: "ethernet" },
    ],
  },

  // Servers
  {
    type: "server",
    name: "Generic Server",
    category: "server",
    description: "Standard dedicated application server node.",
    iconName: "Server",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },
  {
    type: "web-server",
    name: "Web Server",
    category: "server",
    description: "HTTP/HTTPS server hosting web content and responding to GET/POST requests.",
    iconName: "Globe",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
    defaultServices: { http: true },
  },
  {
    type: "dns-server",
    name: "DNS Server",
    category: "server",
    description: "Domain Name System server mapping domain names to IP addresses (A, AAAA, MX).",
    iconName: "Database",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
    defaultServices: { dns: true },
  },
  {
    type: "dhcp-server",
    name: "DHCP Server",
    category: "server",
    description: "Dynamic Host Configuration Protocol server offering network leases (DORA).",
    iconName: "ServerCog",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
    defaultServices: { dhcp: true },
  },
  {
    type: "ftp-server",
    name: "FTP Server",
    category: "server",
    description: "File Transfer Protocol repository server.",
    iconName: "FolderGit2",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },
  {
    type: "mail-server",
    name: "Mail Server",
    category: "server",
    description: "SMTP/IMAP messaging server node.",
    iconName: "Mail",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },
  {
    type: "ntp-server",
    name: "NTP Server",
    category: "server",
    description: "Network Time Protocol clock synchronization server.",
    iconName: "Clock",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },

  // Cloud and WAN
  {
    type: "cloud",
    name: "Internet Cloud",
    category: "cloud-wan",
    description: "Abstract representation of the public Internet infrastructure.",
    iconName: "Cloud",
    defaultInterfaces: [{ name: "wan0", type: "gigabit" }],
  },
  {
    type: "wan-cloud",
    name: "WAN Cloud",
    category: "cloud-wan",
    description: "Wide Area Network backbone connecting remote branch networks.",
    iconName: "CloudLightning",
    defaultInterfaces: [
      { name: "serial0", type: "serial" },
      { name: "serial1", type: "serial" },
    ],
  },
  {
    type: "isp-router",
    name: "ISP Router",
    category: "cloud-wan",
    description: "Provider Edge router establishing eBGP peering connections.",
    iconName: "Radio",
    defaultInterfaces: [
      { name: "GigabitEthernet0/0", type: "gigabit" },
      { name: "GigabitEthernet0/1", type: "gigabit" },
    ],
  },
  {
    type: "autonomous-system",
    name: "Autonomous System Container",
    category: "cloud-wan",
    description: "Container grouping routers under a single BGP Autonomous System Number (ASN).",
    iconName: "Boxes",
    defaultInterfaces: [{ name: "bgp0", type: "ethernet" }],
  },

  // Special Nodes
  {
    type: "packet-source",
    name: "Packet Source",
    category: "special",
    description: "Test traffic generator emitting ICMP/UDP/TCP test flows.",
    iconName: "Send",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },
  {
    type: "packet-destination",
    name: "Packet Destination",
    category: "special",
    description: "Sink node logging and capturing incoming test traffic.",
    iconName: "Inbox",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },
  {
    type: "network-observer",
    name: "Network Observer",
    category: "special",
    description: "Passive monitor logging throughput and packet arrival rates.",
    iconName: "Eye",
    defaultInterfaces: [{ name: "mon0", type: "ethernet" }],
  },
  {
    type: "traffic-generator",
    name: "Traffic Generator",
    category: "special",
    description: "Programmable multi-stream traffic load generator.",
    iconName: "Zap",
    defaultInterfaces: [{ name: "eth0", type: "ethernet" }],
  },
];
