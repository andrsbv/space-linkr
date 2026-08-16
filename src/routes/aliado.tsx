import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, Users, DollarSign, Clock, ArrowUpRight, Zap, Calendar, QrCode, Sliders, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/fp/Header";
import { QrScannerModal } from "@/components/fp/QrScannerModal";
import { InventoryModal } from "@/components/fp/InventoryModal";
import { useReservations, useSpaceData } from "@/lib/focusplace-store";

export const Route = createFileRoute("/aliado")({
  head: () => ({ meta: [{ title: "Panel del aliado — FocusPlace" }] }),
  component: Aliado,
});

// Mock data: ocupación por hora
const HOURS = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
const OCCUPANCY = [20, 35, 60, 80, 90, 75, 28, 18, 22, 30, 55, 70, 65]; // %

function Aliado() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const space = useSpaceData("sweet-urdesa");
  const userReservations = useReservations();

  const lowHours = HOURS.map((h, i) => ({ h, v: OCCUPANCY[i] })).filter((x) => x.v < 35);

  const capacity = space?.capacity || 24;
  const occupied = space?.occupied || 9;
  const occupancyPercent = Math.round((occupied / capacity) * 100);

  // Combine dynamic store reservations with mock rows
  const allReservations = [
    ...userReservations.map((r) => ({
      id: r.id,
      n: `Usuario (${r.id})`,
      h: `${r.start} – ${r.end}`,
      p: r.people,
      s: r.status === "Check-in realizado" ? "Confirmada (Check-in)" : "Pendiente check-in",
      c: r.couponCode,
      isReal: true,
    })),
    { id: "mock-1", n: "María C.", h: "10:00 – 12:00", p: 2, s: "Confirmada (Check-in)", c: "FP10-AX23", isReal: false },
    { id: "mock-2", n: "Jorge P.", h: "14:00 – 16:00", p: 1, s: "Pendiente check-in", c: "FP10-BK77", isReal: false },
    { id: "mock-3", n: "Equipo Lovable", h: "15:30 – 17:30", p: 4, s: "Confirmada (Check-in)", c: "FP10-MN09", isReal: false },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Panel del aliado (Web Admin)</div>
            <h1 className="text-3xl font-bold mt-1">{space?.name || "Sweet & Coffee — Urdesa"}</h1>
            <p className="text-muted-foreground text-sm mt-1">Aprovecha tus horas de baja afluencia y atrae nuevos clientes con FocusPlace.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="h-11 px-5 rounded-full bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2 shadow-md shadow-primary/20 hover:bg-primary/90 transition"
            >
              <QrCode className="size-4" /> Escanear QR de Cliente
            </button>
            <button
              onClick={() => setIsInventoryOpen(true)}
              className="h-11 px-4 rounded-full bg-card border border-border text-foreground font-semibold inline-flex items-center gap-2 hover:bg-secondary transition"
            >
              <Sliders className="size-4 text-primary" /> Modificar Cupos ({occupied}/{capacity})
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <Kpi icon={Users} label="Reservas activas" value={String(allReservations.length)} delta="+22%" />
          <Kpi icon={DollarSign} label="Ingresos atribuidos" value="$312" delta="+18%" />
          <Kpi icon={TrendingUp} label="Ocupación actual en vivo" value={`${occupancyPercent}%`} delta={`${occupied}/${capacity} mesas`} />
          <Kpi icon={Clock} label="Horas de baja demanda" value={space?.lowDemandHours || "14:00–17:00"} delta="Promo activa" highlight />
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mt-4">
          {/* Occupancy chart */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-lg">Afluencia de hoy</div>
                <div className="text-xs text-muted-foreground">Las barras amarillas son tu oportunidad: horarios donde tu local está ocioso.</div>
              </div>
              <div className="flex gap-1 text-[10px]">
                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary">Alta</span>
                <span className="px-2 py-0.5 rounded-full bg-warning/30 text-warning-foreground">Baja</span>
              </div>
            </div>
            <div className="mt-6 flex items-end gap-1.5 h-44">
              {HOURS.map((h, i) => {
                const v = OCCUPANCY[i];
                const low = v < 35;
                return (
                  <div key={h} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${v}%`,
                        background: low ? "oklch(0.78 0.16 75)" : "oklch(0.42 0.09 165)",
                        opacity: low ? 1 : 0.85,
                      }}
                      title={`${h}:00 — ${v}% ocupado`}
                    />
                    <div className="text-[10px] text-muted-foreground">{h}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-primary to-[oklch(0.32_0.07_165)] text-primary-foreground rounded-2xl p-5">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest bg-white/15 px-2 py-1 rounded-full">
              <Zap className="size-3" /> Recomendación FocusPlace
            </div>
            <h3 className="font-display font-bold text-xl mt-3 leading-tight">
              Vende tus horas ociosas como espacio de estudio.
            </h3>
            <p className="text-sm opacity-90 mt-2">
              Tus horarios <strong>{space?.lowDemandHours || lowHours.map((x) => `${x.h}:00`).join(", ")}</strong> tienen baja ocupación.
              Activando la promo, FocusPlace ofrecerá tu local a estudiantes con 10% off + bebida.
            </p>
            <div className="mt-4 bg-white/15 rounded-xl p-3 text-sm">
              <div className="flex justify-between"><span>Visibilidad estimada</span><span className="font-semibold">+850 personas/sem</span></div>
              <div className="flex justify-between mt-1"><span>Reservas proyectadas</span><span className="font-semibold">~22 / semana</span></div>
              <div className="flex justify-between mt-1"><span>Ingresos extra</span><span className="font-semibold">$140 – $190</span></div>
            </div>
            <button
              onClick={() => setIsInventoryOpen(true)}
              className="mt-4 w-full h-11 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 inline-flex items-center justify-center gap-2"
            >
              Ajustar Cupos de Oferta <ArrowUpRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-card border border-border rounded-2xl mt-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="font-display font-bold text-lg flex items-center gap-2">
              <Calendar className="size-5 text-primary" /> Gestión de Reservas y Clientes
            </div>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              <QrCode className="size-3.5" /> Abrir Escáner QR
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left px-5 py-2 font-medium">Cliente / Reserva</th>
                <th className="text-left px-5 py-2 font-medium">Horario</th>
                <th className="text-left px-5 py-2 font-medium">Personas</th>
                <th className="text-left px-5 py-2 font-medium">Estado Check-in</th>
                <th className="text-right px-5 py-2 font-medium">Cupón</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allReservations.map((r, i) => {
                const isCheckedIn = r.s.includes("Check-in");
                return (
                  <tr key={r.id || i} className="hover:bg-muted/40 transition">
                    <td className="px-5 py-3 font-medium flex items-center gap-2">
                      {r.n}
                      {r.isReal && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                          NUEVO
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{r.h}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.p}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          isCheckedIn
                            ? "bg-success/15 text-success"
                            : "bg-warning/25 text-warning-foreground"
                        }`}
                      >
                        {isCheckedIn && <CheckCircle2 className="size-3" />}
                        {r.s}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-accent font-semibold">{r.c}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        spaceId="sweet-urdesa"
      />
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        spaceId="sweet-urdesa"
      />
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 border ${highlight ? "bg-warning/15 border-warning/40" : "bg-card border-border"}`}>
      <div className="flex items-center justify-between">
        <div className={`size-9 rounded-lg grid place-items-center ${highlight ? "bg-warning/30 text-warning-foreground" : "bg-primary/10 text-primary"}`}>
          <Icon className="size-4" />
        </div>
        <span className="text-[11px] font-semibold text-success">{delta}</span>
      </div>
      <div className="text-2xl font-display font-bold mt-3">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

