import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Star, MapPin, Clock, Wifi, Plug, Volume2, Coffee, Snowflake, Users, Calendar, Tag, AlertTriangle, Sparkles } from "lucide-react";
import { Header } from "@/components/fp/Header";
import { AMENITY_LABELS, type Amenity, getSpace, occupancyColor, occupancyLevel } from "@/lib/focusplace-data";
import { addReservation, useSpaceData, useReviews, updateSpaceInventory } from "@/lib/focusplace-store";

function SpaceError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">No se pudo cargar el espacio</h1>
        <p className="text-sm text-muted-foreground mt-2">{error.message || "Intenta nuevamente o vuelve a los resultados."}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={reset} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Reintentar
          </button>
          <Link to="/" className="rounded-md border border-border px-4 py-2 text-sm font-medium">
            Volver
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/space/$id")({
  head: ({ params }) => {
    const s = getSpace(params.id);
    return {
      meta: [
        { title: s ? `${s.name} — FocusPlace` : "Espacio — FocusPlace" },
        { name: "description", content: s?.description ?? "Reserva un espacio en FocusPlace" },
      ],
    };
  },
  loader: ({ params }) => {
    const space = getSpace(params.id);
    if (!space) throw notFound();
    return { space };
  },
  errorComponent: SpaceError,
  
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Espacio no encontrado</h1>
        <Link to="/" className="text-primary mt-2 inline-block">Volver al inicio</Link>
      </div>
    </div>
  ),
  component: SpaceDetail,
});

const ICONS: Record<Amenity, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi, enchufes: Plug, silencio: Volume2, cafe: Coffee, ac: Snowflake, grupal: Users,
};

const SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const UNAVAILABLE = new Set(["12:00", "13:00", "18:00"]);

function SpaceDetail() {
  const { id } = Route.useParams();
  const staticSpace = getSpace(id)!;
  const liveSpace = useSpaceData(id);
  const s = liveSpace || staticSpace;

  const reviews = useReviews(id);

  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState("10:00");
  const [duration, setDuration] = useState(2);
  const [people, setPeople] = useState(1);

  const endIdx = SLOTS.indexOf(start) + duration;
  const end = SLOTS[Math.min(endIdx, SLOTS.length - 1)] ?? "21:00";

  const onReserve = () => {
    const r = addReservation({
      spaceId: s.id,
      spaceName: s.name,
      date, start, end, people,
    });

    updateSpaceInventory(s.id, {
      occupied: Math.min(Number(s.capacity), Number(s.occupied) + Number(people))
    });

    navigate({ to: "/reserva/$id", params: { id: r.id } });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : s.rating;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Volver a resultados
        </Link>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6 mt-4">
          <div>
            <div className="rounded-3xl overflow-hidden aspect-[16/9] bg-muted relative">
              <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
              <div className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full ${occupancyColor(s)}`}>
                {occupancyLevel(s)} ahora · {Math.max(0, s.capacity - s.occupied)} de {s.capacity} libres
              </div>
            </div>

            <div className="mt-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{s.type}</div>
                <h1 className="text-3xl font-bold mt-1">{s.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {s.address}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {s.hours}</span>
                  <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {avgRating} · {s.reviews + reviews.length} reseñas</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {s.pricePerHour === 0 ? "Gratis" : `$${s.pricePerHour.toFixed(2)}`}
                  <span className="text-sm text-muted-foreground font-normal">{s.pricePerHour === 0 ? " · con consumo" : "/hora"}</span>
                </div>
                <div className="text-xs text-muted-foreground">A {s.distanceKm} km de ti</div>
              </div>
            </div>

            <p className="text-foreground/80 mt-5 leading-relaxed">{s.description}</p>

            <div className="mt-6 bg-warning/15 border border-warning/30 rounded-2xl p-4 flex items-start gap-3">
              <Tag className="size-5 text-warning-foreground mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold">Horario de baja demanda: {s.lowDemandHours}</div>
                <div className="text-muted-foreground">Reservando en este horario obtienes <strong className="text-foreground">10% de descuento</strong> y un cupón para canjear en el local.</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-display font-bold text-lg mb-3">Lo que ofrece este lugar</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {(s.amenities as Amenity[]).map((a) => {
                  const I = ICONS[a];
                  return (
                    <div key={a} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                        <I className="size-4" />
                      </div>
                      <span className="text-sm font-medium">{AMENITY_LABELS[a]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <Star className="size-5 fill-amber-400 text-amber-400" /> Reseñas y Experiencia de Usuarios
                  </h3>
                  <p className="text-xs text-muted-foreground">Monitoreo de calidad verificado por check-in QR</p>
                </div>
                <span className="text-sm font-bold bg-muted px-3 py-1 rounded-full">
                  ★ {avgRating} / 5.0
                </span>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-card border border-border rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold">
                        <span>{rev.userName}</span>
                        {rev.userTier === "premium" && (
                          <span className="text-[10px] bg-amber-500/15 text-amber-600 px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                            <Sparkles className="size-2.5" /> PRO
                          </span>
                        )}
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`size-3.5 ${i < rev.rating ? "fill-amber-400" : "fill-muted text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-foreground/80">{rev.comment}</p>
                    {rev.issues && rev.issues.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {rev.issues.map((iss) => (
                          <span key={iss} className="inline-flex items-center gap-1 text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
                            <AlertTriangle className="size-2.5" /> Reportado: {iss}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-display font-bold text-lg mb-3">Ubicación</h3>
              <div className="rounded-2xl overflow-hidden border border-border aspect-[16/7] bg-[oklch(0.95_0.02_165)] relative grid place-items-center">
                <div className="text-center">
                  <div className="size-12 rounded-full bg-primary text-primary-foreground grid place-items-center mx-auto shadow-lg">
                    <MapPin className="size-5" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{s.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation sidebar */}
          <aside className="lg:sticky lg:top-20 h-fit">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="font-display font-bold text-lg flex items-center gap-2">
                <Calendar className="size-5 text-primary" /> Reserva tu espacio
              </div>

              <div className="mt-4 space-y-3">
                <Field label="Fecha">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-muted rounded-lg h-10 px-3 text-sm outline-none focus:ring-2 ring-primary/40" />
                </Field>

                <Field label="Hora de inicio">
                  <div className="grid grid-cols-4 gap-1.5">
                    {SLOTS.map((t) => {
                      const dis = UNAVAILABLE.has(t);
                      const sel = start === t;
                      return (
                        <button
                          key={t}
                          disabled={dis}
                          onClick={() => setStart(t)}
                          className={`h-9 rounded-lg text-xs font-medium transition ${
                            dis ? "bg-muted/50 text-muted-foreground/50 line-through cursor-not-allowed"
                              : sel ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-secondary"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Duración (h)">
                    <select value={duration} onChange={(e) => setDuration(+e.target.value)}
                      className="w-full bg-muted rounded-lg h-10 px-3 text-sm">
                      {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} hora{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </Field>
                  <Field label="Personas">
                    <select value={people} onChange={(e) => setPeople(+e.target.value)}
                      className="w-full bg-muted rounded-lg h-10 px-3 text-sm">
                      {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
                <Row k="Horario" v={`${start} – ${end}`} />
                <Row k="Subtotal" v={s.pricePerHour === 0 ? "Gratis" : `$${(s.pricePerHour * duration).toFixed(2)}`} />
                <Row k="Cupón check-in" v="-10%" muted />
              </div>

              <button
                onClick={onReserve}
                className="mt-5 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow-md shadow-primary/20"
              >
                Reservar ahora
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                No se cobra hasta confirmar. Cancela hasta 1h antes.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={muted ? "text-success font-medium" : "font-medium"}>{v}</span>
    </div>
  );
}

