import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Calendar, Clock, MapPin, QrCode, X, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/fp/Header";
import { useReservations, updateReservation } from "@/lib/focusplace-store";

export const Route = createFileRoute("/mis-reservas")({
  head: () => ({ meta: [{ title: "Mis reservas — FocusPlace" }] }),
  component: MisReservas,
});

function MisReservas() {
  const list = useReservations();
  const pending = list.filter((r) => r.status === "Pendiente");
  const past = list.filter((r) => r.status !== "Pendiente");

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold">Mis reservas</h1>
        <p className="text-muted-foreground mt-1">Recibe recordatorios antes de tu hora de llegada.</p>

        {/* notifications */}
        {pending.length > 0 && (
          <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2 text-sm font-semibold">
              <Bell className="size-4 text-accent" /> Notificaciones recientes
            </div>
            <ul className="divide-y divide-border">
              {pending.slice(0, 3).map((r) => (
                <li key={r.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                  <div className="size-8 rounded-full bg-accent/15 text-accent grid place-items-center"><Clock className="size-4" /></div>
                  <div className="flex-1">
                    <div className="font-medium">Tu reserva en {r.spaceName} es a las {r.start}</div>
                    <div className="text-xs text-muted-foreground">Tienes 15 minutos para hacer check-in al llegar.</div>
                  </div>
                  <Link to="/reserva/$id" params={{ id: r.id }} className="text-xs text-primary font-medium hover:underline">Ver QR</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {list.length === 0 && (
          <div className="mt-10 text-center bg-card border border-dashed border-border rounded-2xl p-12">
            <Calendar className="size-10 text-muted-foreground mx-auto" />
            <div className="font-bold mt-3">Aún no tienes reservas</div>
            <p className="text-sm text-muted-foreground mt-1">Explora espacios cercanos y reserva en segundos.</p>
            <Link to="/" className="inline-flex mt-4 h-10 px-5 rounded-full bg-primary text-primary-foreground font-medium items-center text-sm">Explorar espacios</Link>
          </div>
        )}

        {pending.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display font-bold text-xl mb-3">Próximas</h2>
            <div className="space-y-3">
              {pending.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <Calendar className="size-5" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold">{r.spaceName}</div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 mt-0.5">
                      <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {new Date(r.date).toLocaleDateString("es-EC")}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {r.start}–{r.end}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {r.people} persona{r.people > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <Link to="/reserva/$id" params={{ id: r.id }} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    <QrCode className="size-3.5" /> Mostrar QR
                  </Link>
                  <button
                    onClick={() => updateReservation(r.id, { status: "Cancelada" })}
                    className="inline-flex items-center gap-1 h-9 px-3 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-3.5" /> Cancelar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display font-bold text-xl mb-3">Historial</h2>
            <div className="space-y-2">
              {past.map((r) => (
                <div key={r.id} className="bg-card/60 border border-border rounded-xl p-3 flex items-center gap-3 text-sm">
                  {r.status === "Check-in realizado" ? <CheckCircle2 className="size-4 text-success" /> : <X className="size-4 text-destructive" />}
                  <div className="flex-1">
                    <div className="font-medium">{r.spaceName}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("es-EC")} · {r.start}–{r.end}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.status}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
