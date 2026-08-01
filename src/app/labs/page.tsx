import { AppHeader } from "@/components/layout/app-sidebar";
import { LabsDashboard } from "@/components/labs/labs-dashboard";

export default function LabsPage() {
  return (
    <>
      <AppHeader title="Interactive Networking Labs" description="Learn networking by configuring, simulating, testing, and troubleshooting real scenarios." />
      <LabsDashboard />
    </>
  );
}
