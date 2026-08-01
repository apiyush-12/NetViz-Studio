export type StatusBadgeType = "available" | "in-development" | "planned";

export interface LandingFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  status: StatusBadgeType;
  details?: string[];
  authenticationRequired?: boolean;
}

export interface LandingProtocol {
  id: string;
  name: string;
  layer: string;
  category: string;
  status: StatusBadgeType;
  description: string;
  keyFeatures: string[];
  href: string;
}

export interface LandingFaq {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface LandingAudienceCard {
  id: string;
  title: string;
  role: string;
  description: string;
  benefits: string[];
  iconName: string;
}

export interface LandingCapabilityItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface LandingAuthState {
  status: "loading" | "authenticated" | "unauthenticated" | "error";
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
  isConfigured: boolean;
}

export interface IntendedDestination {
  pathname: string;
  search?: string;
  source: "hero" | "lab" | "topology" | "simulation" | "dashboard" | "cidr";
}
