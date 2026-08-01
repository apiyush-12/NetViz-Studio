"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-sidebar";
import { Card, CardContent, Button, Input, Label } from "@/components/ui";
import { ArrowLeft, FileDown, PlusCircle } from "lucide-react";
import { SAMPLE_TOPOLOGIES } from "@/data/sample-topologies";
import { NetworkLab } from "@/features/labs/lab-types";

export default function CustomLabPage() {
  const [title, setTitle] = useState("Custom Network Lab");
  const [description, setDescription] = useState("A custom lab created using the Custom Lab Builder.");
  const [jsonOutput, setJsonOutput] = useState("");

  const handleGenerate = () => {
    const customLab: NetworkLab = {
      id: `custom-lab-${Date.now()}`,
      slug: `custom-lab-${Date.now()}`,
      title,
      description,
      topic: "design",
      difficulty: "intermediate",
      type: "challenge",
      estimatedMinutes: 20,
      prerequisites: ["Custom Topology"],
      learningObjectives: ["Complete custom network challenge objectives."],
      skills: ["Custom Lab Builder"],
      protocols: ["IPv4", "ICMP"],
      initialTopology: SAMPLE_TOPOLOGIES[0].getTopology(),
      tasks: [
        {
          id: "custom-t1",
          order: 1,
          title: "Custom Objective 1",
          instruction: "Verify connectivity between PC-1 and PC-2.",
          type: "send-ping",
          required: true,
          points: 50,
          validator: {
            type: "packetDelivered",
            sourceNodeId: "pc-1",
            destinationNodeId: "pc-2",
            protocol: "ICMP",
          },
          successMessage: "Custom objective completed!",
          failureMessage: "Validation failed.",
        },
      ],
      completionCriteria: { minScore: 50, requiredTaskIds: ["custom-t1"] },
      hints: [{ id: "h1", level: 1, content: "Check host IP configuration." }],
      explanationSections: [{ title: "Overview", content: "Custom lab definition." }],
      relatedLabIds: [],
      version: 1,
      published: true,
    };

    setJsonOutput(JSON.stringify(customLab, null, 2));
  };

  return (
    <>
      <AppHeader title="Custom Lab Builder" description="Create, customize, export, and import custom networking labs." />
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <Link href="/labs">
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold">Configure Custom Lab Metadata</h2>
            <div className="space-y-3 text-xs">
              <div>
                <Label>Lab Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 text-xs" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>

            <Button size="sm" onClick={handleGenerate} className="gap-1.5">
              <PlusCircle className="h-4 w-4" /> Generate Declarative JSON
            </Button>
          </CardContent>
        </Card>

        {jsonOutput && (
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Declarative Lab Specification JSON</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(jsonOutput);
                    alert("Copied custom lab JSON to clipboard!");
                  }}
                  className="gap-1 text-xs"
                >
                  <FileDown className="h-3.5 w-3.5" /> Copy JSON
                </Button>
              </div>
              <textarea
                readOnly
                value={jsonOutput}
                className="w-full h-64 bg-slate-950 text-slate-200 font-mono text-xs p-3 rounded-lg border border-border"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
