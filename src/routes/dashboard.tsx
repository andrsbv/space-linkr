import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users,
  CalendarCheck,
  DollarSign,
  Percent,
  Star,
  Repeat,
  Store,
  Target,
  TrendingUp,
  Download,
} from "lucide-react";
import { Header } from "@/components/fp/Header";
import { SPACES } from "@/lib/focusplace-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard de indicadores — FocusPlace" },
      {
        name: "description",
        content:
          "Dashboard de FocusPlace con los indicadores clave del servicio: usuarios activos, reservas, ocupación en horas de baja demanda, ingresos, conversión, retención y satisfacción.",
      },
      { property: "og:title", content: "Dashboard de indicadores — FocusPlace" },
      {
        property: "og:description",
        content:
          "KPIs del prototipo FocusPlace: reservas, ocupación, ingresos, conversión, retención y NPS por periodo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Period = "7d" | "30d" | "90d";

const PERIODS: { id: Period; label: string; factor: number }[] = [
  { id: "7d", label: "7 días", factor: 1 },
  { id: "30d", label: "30 días", factor: 4.1 },
  { id: "90d", label: "90 días", factor: 11.6 },
];

const WEEKS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
const RESERVATIONS_TREND = [42, 58, 71, 66, 89, 104, 121, 138];
const REVENUE_TREND = [180, 240, 305, 290, 386, 452, 528, 604];

const HOURS = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
const BEFORE = [18, 26, 40, 62, 74, 58, 20, 14, 16, 24, 46, 60, 52];
const AFTER = [30, 48, 66, 80, 86, 74, 52, 46, 49, 55, 68, 76, 63];

const FUNNEL = [
  { label: "Visitas a la app", value: 4820 },
  { label: "Búsquedas de espacio", value: 3110 },
  { label: "Detalle de espacio abierto", value: 1740 },
  { label: "Reservas creadas", value: 642 },
  { label: "Check-in confirmado", value: 501 },
];

function Dashboard() {
  const [period, setPeriod] = useState<Period>("30d");
  const factor = PERIODS.find((p) => p.id === period)!.factor;

  const kpis = useMemo(
    () => [
      { icon: Users, label: "Usuarios activos", value: Math.round(312 * factor).toLocaleString("es-EC"), delta: "+24%", meta: "Meta: 1.500" },
      { icon: CalendarCheck, label: "Reservas completadas", value: Math.round(138 * factor).toLocaleString("es-EC"), delta: "+31%", meta: "Meta: 600" },
      { icon: DollarSign, label: "Ingresos por comisión", value: "$" + Math.round(604 * factor * 0.12).toLocaleString("es-EC"), delta: "+27%", meta: "Meta: $350" },
      { icon: Percent, label: "Tasa de conversión", value: "20.6%", delta: "+3.1 pts", meta: "Meta: 18%", highlight: true },
      { icon: Repeat, label: "Retención mensual", value: "46%", delta: "+6 pts", meta: "Meta: 40%" },
      { icon: Star, label: "Satisfacción (NPS)", value: "62", delta: "+8", meta: "Meta: 55" },
      { icon: Store, label: "Aliados activos", value: Math.round(9 * Math.min(factor, 3)).toString(), delta: "+4", meta: "Meta: 25" },
      { icon: Target, label: "Ocupación en horas ociosas", value: "51%", delta: "+23 pts", meta: "Meta: 45%", highlight: true },
    ],
    [factor],
  );

  const maxRes = Math.max(...RESERVATIONS_TREND);
  const maxRev = Math.max(...REVENUE_TREND);

  const linePoints = (data: number[], max: number) =>
    data
      .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 92}`)
      .join(" ");

  const topSpaces = SPACES.map((s, i) => ({
    name: s.name,
    type: s.type,
    reservas: [128, 96, 74, 61, 43, 37][i] ?? 20,
    ocupacion: Math.round((s.occupied / s.capacity) * 100),
    ingreso: "$" + ([214, 336, 128, 182, 96, 74][i] ?? 60),
    rating: s.rating,
  })).sort((a, b) => b.reservas - a.reservas);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Dashboard de indicadores
            </div>
            <h1 className="text-3xl font-display font-bold mt-1">Desempeño de FocusPlace</h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              Indicadores propuestos en el documento del servicio, medidos sobre la operación del
              prototipo: demanda de estudiantes y freelancers, y aprovechamiento de horas ociosas
              en los locales aliados.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full border border-border bg-card p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 h-8 rounded-full text-xs font-semibold transition ${
                    period === p.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button className="h-10 px-4 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold inline-flex items-center gap-2 hover:bg-secondary/80 transition">
              <Download className="size-4" /> Exportar
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {kpis.map((k) => (
            <Kpi key={k.label} {...k} />
          ))}
        </div>

        {/* Trends */}
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display font-bold text-lg">Reservas por semana</div>
                <div className="text-xs text-muted-foreground">
                  Crecimiento sostenido desde el lanzamiento del piloto
                </div>
              </div>
              <span className="text-xs font-semibold text-success inline-flex items-center gap-1">
                <TrendingUp className="size-3.5" /> +228%
              </span>
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-40 mt-5">
              <polyline
                points={linePoints(RESERVATIONS_TREND, maxRes)}
                fill="none"
                stroke="oklch(0.42 0.09 165)"
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={linePoints(REVENUE_TREND, maxRev)}
                fill="none"
                stroke="oklch(0.78 0.16 75)"
                strokeWidth="1.6"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              {WEEKS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="flex gap-4 text-[11px] mt-3">
              <Legend color="oklch(0.42 0.09 165)" label="Reservas" />
              <Legend color="oklch(0.78 0.16 75)" label="Ingresos ($)" dashed />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="font-display font-bold text-lg">
              Ocupación por hora: antes vs. con FocusPlace
            </div>
            <div className="text-xs text-muted-foreground">
              Impacto en los horarios de baja demanda (14:00 – 17:00)
            </div>
            <div className="mt-6 flex items-end gap-1.5 h-40">
              {HOURS.map((h, i) => (
                <div key={h} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full h-full flex items-end gap-[2px]">
                    <div
                      className="flex-1 rounded-t-sm bg-muted"
                      style={{ height: `${BEFORE[i]}%` }}
                      title={`${h}:00 antes — ${BEFORE[i]}%`}
                    />
                    <div
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${AFTER[i]}%`,
                        background: "oklch(0.42 0.09 165)",
                      }}
                      title={`${h}:00 con FocusPlace — ${AFTER[i]}%`}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground">{h}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-[11px] mt-3">
              <Legend color="oklch(0.88 0.01 165)" label="Sin FocusPlace" />
              <Legend color="oklch(0.42 0.09 165)" label="Con FocusPlace" />
            </div>
          </div>
        </div>

        {/* Funnel + distribution */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-4 mt-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="font-display font-bold text-lg">Embudo de conversión</div>
            <div className="text-xs text-muted-foreground">
              De la visita a la app hasta el check-in en el local
            </div>
            <div className="mt-5 space-y-2.5">
              {FUNNEL.map((f, i) => {
                const pct = (f.value / FUNNEL[0].value) * 100;
                return (
                  <div key={f.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{f.label}</span>
                      <span className="text-muted-foreground">
                        {f.value.toLocaleString("es-EC")} · {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `oklch(${0.42 + i * 0.07} 0.09 165)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="font-display font-bold text-lg">Indicadores de servicio</div>
            <div className="text-xs text-muted-foreground">Calidad de la experiencia medida en el piloto</div>
            <div className="mt-5 space-y-4">
              <Gauge label="Reservas con check-in efectivo" value={78} target={75} />
              <Gauge label="Cupones canjeados" value={64} target={60} />
              <Gauge label="Espacios con ocupación &gt; 40%" value={57} target={50} />
              <Gauge label="Cancelaciones" value={12} target={15} invert />
              <Gauge label="Reseñas ≥ 4 estrellas" value={91} target={85} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl mt-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-border font-display font-bold text-lg">
            Desempeño por local aliado
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Local</th>
                  <th className="text-left px-5 py-2 font-medium">Tipo</th>
                  <th className="text-right px-5 py-2 font-medium">Reservas</th>
                  <th className="text-right px-5 py-2 font-medium">Ocupación</th>
                  <th className="text-right px-5 py-2 font-medium">Ingresos</th>
                  <th className="text-right px-5 py-2 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topSpaces.map((s) => (
                  <tr key={s.name} className="hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.type}</td>
                    <td className="px-5 py-3 text-right">{s.reservas}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${s.ocupacion}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{s.ocupacion}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">{s.ingreso}</td>
                    <td className="px-5 py-3 text-right">★ {s.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  meta,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta: string;
  meta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        highlight ? "bg-warning/15 border-warning/40" : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`size-9 rounded-lg grid place-items-center ${
            highlight ? "bg-warning/30 text-warning-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-4" />
        </div>
        <span className="text-[11px] font-semibold text-success">{delta}</span>
      </div>
      <div className="text-2xl font-display font-bold mt-3">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground/80 mt-1">{meta}</div>
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span
        className="w-4 h-0.5 rounded-full"
        style={{ background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 3px, transparent 3px 6px)` : color }}
      />
      {label}
    </span>
  );
}

function Gauge({
  label,
  value,
  target,
  invert,
}: {
  label: string;
  value: number;
  target: number;
  invert?: boolean;
}) {
  const ok = invert ? value <= target : value >= target;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium" dangerouslySetInnerHTML={{ __html: label }} />
        <span className={ok ? "text-success font-semibold" : "text-destructive font-semibold"}>
          {value}% <span className="text-muted-foreground font-normal">/ meta {target}%</span>
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${ok ? "bg-success" : "bg-destructive"}`}
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
          style={{ left: `${target}%` }}
        />
      </div>
    </div>
  );
}
