"use client";

import type { ExplanationContent } from "@/features/simulation/simulation-types";
import { useSimulationStore } from "@/features/simulation/simulation-store";
import { getProtocol } from "@/features/protocols/registry";
import { getTcpExplanation } from "@/features/protocols/tcp/tcp.explanations";
import { Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEFAULT_PREFERENCES, STORAGE_KEYS } from "@/lib/constants";

export function ExplanationPanel() {
  const selectedEventId = useSimulationStore((s) => s.selectedEventId);
  const events = useSimulationStore((s) => s.events);
  const protocolId = useSimulationStore((s) => s.protocolId);
  const [prefs] = useLocalStorage(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES);

  const event = events.find((e) => e.id === selectedEventId);
  const protocol = protocolId ? getProtocol(protocolId) : null;

  if (!event) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select an event from the timeline to see a detailed explanation.
          </p>
        </CardContent>
      </Card>
    );
  }

  let explanation: ExplanationContent = {
    whatHappened: event.description,
    whyItHappened: "Part of the protocol operation sequence.",
    protocolRule: `${protocol?.name ?? "Protocol"} specification rules apply.`,
    fieldsChanged: [] as string[],
    whatHappensNext: "Continue the simulation to see subsequent events.",
    misconception: undefined,
    realWorldUse: undefined,
  };

  if (protocolId === "tcp") {
    explanation = getTcpExplanation(event.type, prefs.explanationMode);
  } else if (protocol) {
    const section = protocol.explanationSections.find((s) => s.eventType === event.type);
    if (section) {
      explanation = prefs.explanationMode === "advanced" ? section.advanced : section.beginner;
    }
  }

  const sections = [
    { label: "What happened?", content: explanation.whatHappened },
    { label: "Why did it happen?", content: explanation.whyItHappened },
    { label: "Protocol rule", content: explanation.protocolRule },
    { label: "What happens next?", content: explanation.whatHappensNext },
  ];

  if (explanation.misconception) {
    sections.push({ label: "Common misconception", content: explanation.misconception });
  }
  if (explanation.realWorldUse) {
    sections.push({ label: "Real-world use", content: explanation.realWorldUse });
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle className="text-sm">{event.title}</CardTitle>
        <p className="text-xs text-muted-foreground capitalize">{event.type.replace(/-/g, " ")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map((section) => (
          <div key={section.label}>
            <h4 className="text-xs font-semibold text-primary mb-1">{section.label}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
          </div>
        ))}

        {explanation.fieldsChanged.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-primary mb-1">Fields changed</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-4">
                {explanation.fieldsChanged.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {protocol?.simplificationNotes && protocol.simplificationNotes.length > 0 && (
          <>
            <Separator />
            <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-2">
              <h4 className="text-xs font-semibold text-amber-400 mb-1">Educational simplification</h4>
              <ul className="text-xs text-muted-foreground list-disc pl-4">
                {protocol.simplificationNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
