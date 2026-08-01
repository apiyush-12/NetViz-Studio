export type AddressType =
  | "public"
  | "private"
  | "loopback"
  | "link-local"
  | "multicast"
  | "limited-broadcast"
  | "documentation"
  | "reserved";

export interface CidrError {
  isValid: false;
  message: string;
  field?: string;
}

export interface CidrResult {
  isValid: true;
  input: string;
  ipAddress: string;
  prefixLength: number;
  cidrNotation: string;
  ipBinary: string;
  subnetMask: string;
  subnetMaskBinary: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string | null;
  lastUsableHost: string | null;
  totalAddresses: string;
  usableHostCount: string;
  usableRange: string;
  networkBits: number;
  hostBits: number;
  addressTypes: AddressType[];
  legacyClass: "A" | "B" | "C" | "D" | "E" | "N/A";
  isPointToPoint: boolean;
  isHostRoute: boolean;
}

export type CidrCalculation = CidrResult | CidrError;

export interface SubnetSplitResult {
  prefixLength: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string | null;
  lastUsableHost: string | null;
  totalAddresses: string;
  usableHostCount: string;
}
