import { AppHeader } from "@/components/layout/app-sidebar";
import { CidrCalculator } from "@/components/cidr/cidr-calculator-view";

export default function CidrPage() {
  return (
    <>
      <AppHeader
        title="CIDR & Subnetting"
        description="IPv4 address calculator with binary visualization and subnet splitting"
      />
      <div className="p-4 md:p-6">
        <CidrCalculator />
      </div>
    </>
  );
}
