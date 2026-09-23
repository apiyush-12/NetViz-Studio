import { z } from "zod";

export const vlanConfigSchema = z.object({
  topologyPreset: z.enum([
    "multi_vlan_access_switch",
    "two_switch_trunking",
    "router_on_a_stick",
    "layer3_switch_svi",
    "vlan_hopping_security",
  ]).default("multi_vlan_access_switch"),
  scenarioId: z.enum([
    "intra_vlan_broadcast_isolation",
    "trunk_8021q_tagging",
    "inter_vlan_router_on_a_stick",
    "inter_vlan_l3_svi",
    "native_vlan_untagged",
    "vlan_hopping_attack",
  ]).default("intra_vlan_broadcast_isolation"),
  sourceNodeId: z.string().default("pc-1"),
  targetNodeId: z.string().default("pc-2"),
  nativeVlanId: z.number().min(1).max(4094).default(1),
  trunkAllowedVlans: z.array(z.number()).default([1, 10, 20, 30]),
  routingMode: z.enum(["roas", "svi", "none"]).default("none"),
  enableDoubleTagging: z.boolean().default(false),
  tagNativeVlan: z.boolean().default(false),
});

export type VlanConfigInput = z.infer<typeof vlanConfigSchema>;
