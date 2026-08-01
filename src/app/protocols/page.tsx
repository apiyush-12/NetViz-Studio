import { AppHeader } from "@/components/layout/app-sidebar";
import { ProtocolCard } from "@/components/protocols/protocol-card";
import { getAllProtocols } from "@/features/protocols/registry";
import { PROTOCOL_CATEGORIES } from "@/lib/constants";

export default function ProtocolsPage() {
  const protocols = getAllProtocols();

  return (
    <>
      <AppHeader
        title="Protocol Library"
        description="Browse networking protocols — implemented and planned"
      />
      <div className="p-4 md:p-6 space-y-8">
        {PROTOCOL_CATEGORIES.map((cat) => {
          const catProtocols = protocols.filter((p) => p.category === cat.id);
          if (catProtocols.length === 0) return null;
          return (
            <section key={cat.id}>
              <h2 className="text-lg font-semibold mb-3">{cat.label}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {catProtocols.map((p) => (
                  <ProtocolCard key={p.id} protocol={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
