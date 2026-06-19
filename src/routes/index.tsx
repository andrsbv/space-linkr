import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Wifi, Plug, Volume2, Coffee, Snowflake, Users, MapPin, Sparkles } from "lucide-react";
import { Header } from "@/components/fp/Header";
import { SpaceCard } from "@/components/fp/SpaceCard";
import { MiniMap } from "@/components/fp/Map";
import { SPACES, type Amenity } from "@/lib/focusplace-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FocusPlace — Encuentra dónde estudiar o trabajar cerca de ti" },
      { name: "description", content: "Reserva en tiempo real cafeterías, coworkings y bibliotecas con WiFi, enchufes y ambiente para enfocarte." },
      { property: "og:title", content: "FocusPlace" },
      { property: "og:description", content: "Espacios cercanos, disponibles y reservables al instante." },
    ],
  }),
  component: Home,
});

const FILTERS: { key: Amenity; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "wifi", label: "WiFi", Icon: Wifi },
  { key: "enchufes", label: "Enchufes", Icon: Plug },
  { key: "silencio", label: "Silencioso", Icon: Volume2 },
  { key: "cafe", label: "Café", Icon: Coffee },
  { key: "ac", label: "Aire", Icon: Snowflake },
  { key: "grupal", label: "Grupal", Icon: Users },
];

function Home() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Set<Amenity>>(new Set());
  const [maxKm, setMaxKm] = useState(10);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filtered = useMemo(() => {
    return SPACES.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q.toLowerCase()) && !s.address.toLowerCase().includes(q.toLowerCase())) return false;
      if (s.distanceKm > maxKm) return false;
      if (onlyAvailable && s.occupied / s.capacity >= 0.85) return false;
      for (const a of active) if (!s.amenities.includes(a)) return false;
      return true;
    });
  }, [q, active, maxKm, onlyAvailable]);

  const toggle = (a: Amenity) => {
    const n = new Set(active);
    n.has(a) ? n.delete(a) : n.add(a);
    setActive(n);
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              <Sparkles className="size-3" /> 6 espacios disponibles cerca de ti
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-3 leading-[1.05]">
              Encuentra el lugar perfecto<br />
              <span className="text-primary">para enfocarte hoy.</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-base max-w-lg">
              Cafeterías, coworkings y bibliotecas cercanas con disponibilidad en tiempo real. Reserva en segundos y aprovecha cupones al hacer check-in.
            </p>
          </div>
          <div className="flex gap-2">
            <Stat n="120+" label="Espacios" />
            <Stat n="2.5k" label="Reservas/mes" />
            <Stat n="4.7★" label="Rating" />
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-4 h-12">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por zona, local o dirección…"
                className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
            <button className="h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm inline-flex items-center gap-2 hover:bg-primary/90 transition">
              <Search className="size-4" /> Buscar
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground ml-1" />
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => toggle(f.key)}
                className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium border transition ${
                  active.has(f.key)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-foreground hover:border-primary/40"
                }`}
              >
                <f.Icon className="size-3.5" /> {f.label}
              </button>
            ))}
            <div className="h-6 w-px bg-border mx-1" />
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              Radio: <strong className="text-foreground">{maxKm} km</strong>
              <input
                type="range" min={1} max={10} value={maxKm}
                onChange={(e) => setMaxKm(+e.target.value)}
                className="w-28 accent-[oklch(0.42_0.09_165)]"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-xs">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="accent-[oklch(0.42_0.09_165)]" />
              Solo con cupos
            </label>
          </div>
        </div>
      </section>

      {/* Results + Map */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{filtered.length} espacios cerca de ti</h2>
            <select className="bg-card border border-border rounded-full px-3 h-9 text-sm">
              <option>Más cercanos</option>
              <option>Mejor calificados</option>
              <option>Más disponibles</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((s) => (<SpaceCard key={s.id} s={s} />))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground bg-card border border-dashed border-border rounded-2xl">
                No encontramos espacios con esos filtros. Prueba ampliar el radio o quitar amenities.
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 h-fit space-y-4">
          <MiniMap spaces={filtered} />
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Leyenda</div>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-success" /> Disponible</div>
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-warning" /> Medio lleno</div>
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-destructive" /> Lleno</div>
            </div>
          </div>
          <Link to="/aliado" className="block bg-gradient-to-br from-primary to-[oklch(0.32_0.07_165)] text-primary-foreground rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider opacity-80">¿Tienes un local?</div>
            <div className="font-display font-bold text-lg leading-tight mt-1">Convierte tu espacio ocioso en ingresos</div>
            <div className="text-xs opacity-90 mt-2">Llena tus horarios de baja demanda →</div>
          </Link>
        </aside>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2 text-center">
      <div className="font-display font-bold text-lg leading-none">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
