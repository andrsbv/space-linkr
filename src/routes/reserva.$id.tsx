import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Calendar, Clock, Users, Tag, Share2, Download, QrCode, Star } from "lucide-react";
import { Header } from "@/components/fp/Header";
import { ReviewModal } from "@/components/fp/ReviewModal";
import { useReservations, updateReservation, getMergedSpace, type Reservation } from "@/lib/focusplace-store";

export const Route = createFileRoute("/reserva/$id")({
  head: () => ({ meta: [{ title: "Reserva confirmada — FocusPlace" }] }),
  component: ReservaPage,
});

function ReservaPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const reservations = useReservations();
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const r = reservations.find((x) => x.id === id);

  useEffect(() => {
    if (reservations.length > 0 && !r) {
      navigate({ to: "/" });
    }
  }, [id, r, reservations, navigate]);

  if (!r) return null;
  const space = getMergedSpace(r.spaceId);
  const checkedIn = r.status === "Check-in realizado";

  const doCheckIn = () => {
    updateReservation(r.id, { status: "Check-in realizado", checkedInAt: Date.now() });
  };

  const qrPayload = encodeURIComponent(
    JSON.stringify({ rsv: r.id, space: r.spaceId, coupon: r.couponCode })
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=2&data=${qrPayload}`;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* success banner */}
        <div className="text-center">
          <div className="inline-flex size-16 rounded-full bg-success/15 text-success items-center justify-center">
            <CheckCircle2 className="size-9" />
          </div>
          <h1 className="text-3xl font-bold mt-3">¡Reserva confirmada!</h1>
          <p className="text-muted-foreground mt-1">
            Te enviamos los detalles al correo y notificación a tu celular.
          </p>
          <div className="text-xs text-muted-foreground mt-1">Código: <strong className="text-foreground">{r.id}</strong></div>
        </div>

        {/* Ticket */}
        <div className="mt-8 bg-card border border-border rounded-3xl overflow-hidden shadow-lg shadow-primary/5">
          <div className="bg-gradient-to-br from-primary to-[oklch(0.32_0.07_165)] text-primary-foreground p-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest opacity-80">Tu pase de acceso</div>
              <div className="font-display font-bold text-2xl leading-tight mt-1">{r.spaceName}</div>
              <div className="text-sm opacity-90 mt-1 flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {space?.address}
              </div>
            </div>
            <QrCode className="size-12 opacity-80" />
          </div>

          {/* perforation */}
          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-border" />
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 size-6 rounded-full bg-background border border-border" />
            <div className="absolute right-0 top-1/2 -translate-x-1/2 -translate-y-1/2 size-6 rounded-full bg-background border border-border" style={{ transform: "translate(50%, -50%)" }} />
          </div>

          <div className="p-6 grid sm:grid-cols-[auto_1fr] gap-6 items-start">
            <div className="mx-auto text-center">
              <div className="bg-white p-3 rounded-2xl border border-border">
                <img src={qrUrl} alt="Código QR de check-in" className="size-48 block" />
              </div>
              <div className="text-xs text-muted-foreground mt-2 font-mono">
                {checkedIn ? "✓ QR Validado por Aliado" : "Muestra este QR en el local"}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Detail icon={Calendar} k="Fecha" v={new Date(r.date).toLocaleDateString("es-EC", { weekday: "short", day: "numeric", month: "short" })} />
                <Detail icon={Clock} k="Horario" v={`${r.start} – ${r.end}`} />
                <Detail icon={Users} k="Personas" v={String(r.people)} />
                <Detail icon={Tag} k="Estado" v={checkedIn ? "Check-in OK" : "Pendiente"} highlight={checkedIn} />
              </div>

              {/* coupon */}
              <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wider text-accent-foreground/80 font-semibold">Cupón al hacer check-in</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="font-display font-bold text-2xl text-accent">10% OFF</div>
                  <div className="text-sm text-muted-foreground">en una bebida</div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <code className="bg-card border border-dashed border-accent/40 px-3 py-1.5 rounded-lg text-sm font-mono">{r.couponCode}</code>
                  <button onClick={() => navigator.clipboard?.writeText(r.couponCode)} className="text-xs text-primary font-medium hover:underline">Copiar</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!checkedIn ? (
                  <button onClick={doCheckIn} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition text-xs">
                    Simular Check-in Manual
                  </button>
                ) : (
                  <button
                    onClick={() => setIsReviewOpen(true)}
                    className="flex-1 h-11 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition flex items-center justify-center gap-2 text-xs shadow"
                  >
                    <Star className="size-4 fill-slate-950" /> Dejar Reseña del Local
                  </button>
                )}
                <button className="h-11 px-4 rounded-xl bg-muted hover:bg-secondary transition inline-flex items-center gap-2 text-sm font-medium">
                  <Share2 className="size-4" /> Compartir
                </button>
                <button className="h-11 px-4 rounded-xl bg-muted hover:bg-secondary transition inline-flex items-center gap-2 text-sm font-medium">
                  <Download className="size-4" /> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3 text-sm">
          <Link to="/mis-reservas" className="text-primary font-medium hover:underline">Ver mis reservas</Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/" className="text-muted-foreground hover:text-foreground">Reservar otro espacio</Link>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        spaceId={r.spaceId}
        spaceName={r.spaceName}
      />
    </div>
  );
}

function Detail({ icon: Icon, k, v, highlight }: { icon: React.ComponentType<{ className?: string }>; k: string; v: string; highlight?: boolean }) {
  return (
    <div className="bg-muted/60 rounded-xl px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <Icon className="size-3" /> {k}
      </div>
      <div className={`text-sm font-semibold mt-0.5 ${highlight ? "text-success" : ""}`}>{v}</div>
    </div>
  );
}

