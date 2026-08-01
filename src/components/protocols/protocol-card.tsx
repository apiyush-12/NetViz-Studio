import Link from "next/link";
import { Badge, Card, CardContent, Button } from "@/components/ui";
import type { ProtocolModule } from "@/features/protocols/shared/protocol-types";
import { Activity, Lock } from "lucide-react";

const statusBadge = {
  implemented: { label: "Implemented", variant: "success" as const },
  basic: { label: "Basic", variant: "warning" as const },
  planned: { label: "Planned", variant: "outline" as const },
};

export function ProtocolCard({ protocol }: { protocol: ProtocolModule }) {
  const badge = statusBadge[protocol.status];
  const isAvailable = protocol.status !== "planned";

  const content = (
    <Card className={`flex flex-col justify-between h-full transition-all border-border bg-card/80 ${isAvailable ? "hover:border-primary/50 hover:shadow-md cursor-pointer group" : "opacity-60"}`}>
      <CardContent className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={badge.variant} className="text-[10px]">
              {badge.label}
            </Badge>
            <span className="text-[10px] uppercase font-mono text-muted-foreground">{protocol.layer}</span>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {protocol.name}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{protocol.summary}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Badge variant="outline" className="text-[9px] uppercase font-mono">
            {protocol.id}
          </Badge>

          <Button size="sm" variant={isAvailable ? "secondary" : "ghost"} disabled={!isAvailable} className="h-7 text-xs gap-1">
            {isAvailable ? (
              <>
                <Activity className="h-3.5 w-3.5 text-primary" /> Launch
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" /> Soon
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isAvailable) {
    return <Link href={`/protocols/${protocol.id}`}>{content}</Link>;
  }

  return content;
}
