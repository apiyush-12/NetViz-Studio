"use client";

import React, { use } from "react";
import { LabWorkspace } from "@/components/labs/workspace/lab-workspace";

interface LabRunPageProps {
  params: Promise<{ labId: string }>;
}

export default function LabRunPage({ params }: LabRunPageProps) {
  const { labId } = use(params);
  return <LabWorkspace labId={labId} />;
}
