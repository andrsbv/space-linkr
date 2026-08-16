import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users,
  CalendarCheck,
  DollarSign,
  Percent,
  Star,
  Store,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  Server,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Header } from "@/components/fp/Header";
import { SPACES } from "@/lib/focusplace-data";
import { useReservations, useReviews } from "@/lib/focusplace-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard de Indicadores — FocusPlace" },
      {
        name: "description",
        content:
          "Dashboard del módulo analítico de FocusPlace con gráficos de barras, líneas y semáforos de calidad.",
      },
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

// --- 1. Crecimiento de usuarios activos (Barras) ---
const USER_GROWTH_DATA = [
  { mes: "Mar", activos: 120, crecimiento: 12.0 },
  { mes: "Abr", activos: 165, crecimiento: 37.5 },
  { mes: "May", activos: 210, crecimiento: 27.2 },
  { mes: "Jun", activos: 280, crecimiento: 33.3 },
  { mes: "Jul", activos: 360, crecimiento: 28.5 },
  { mes: "Ago", activos: 450, crecimiento: 25.0 },
];

// --- 2. Tasa de ocupación de espacios (Barras) ---
const OCCUPANCY_DATA = [
  { mes: "Mar", ocupacionPct: 42, reservados: 126, disponibles: 300 },
  { mes: "Abr", ocupacionPct: 54, reservados: 189, disponibles: 350 },
  { mes: "May", ocupacionPct: 61, reservados: 244, disponibles: 400 },
  { mes: "Jun", ocupacionPct: 68, reservados: 306, disponibles: 450 },
  { mes: "Jul", ocupacionPct: 74, reservados: 370, disponibles: 500 },
  { mes: "Ago", ocupacionPct: 82, reservados: 451, disponibles: 550 },
];

// --- 3. Nivel de satisfacción (Barras) ---
const SATISFACTION_DATA = [
  { mes: "Mar", rating: 4.2, resenas: 45 },
  { mes: "Abr", rating: 4.4, resenas: 78 },
  { mes: "May", rating: 4.5, resenas: 112 },
  { mes: "Jun", rating: 4.7, resenas: 164 },
  { mes: "Jul", rating: 4.8, resenas: 220 },
  { mes: "Ago", rating: 4.9, resenas: 312 },
];

// --- 4. Tasa de conversión a Premium (Barras) ---
const CONVERSION_DATA = [
  { mes: "Mar", tasaPct: 4.2, suscritos: 5 },
  { mes: "Abr", tasaPct: 6.8, suscritos: 11 },
  { mes: "May", tasaPct: 9.5, suscritos: 20 },
  { mes: "Jun", tasaPct: 12.4, suscritos: 35 },
  { mes: "Jul", tasaPct: 15.1, suscritos: 54 },
  { mes: "Ago", tasaPct: 18.6, suscritos: 84 },
];

// --- 6. Tasa de no-shows / ausencias (Líneas) ---
const NOSHOW_DATA = [
  { semana: "S1", noShowPct: 18.5 },
  { semana: "S2", noShowPct: 15.2 },
  { semana: "S3", noShowPct: 12.4 },
  { semana: "S4", noShowPct: 9.8 },
  { semana: "S5", noShowPct: 8.1 },
  { semana: "S6", noShowPct: 6.5 },
  { semana: "S7", noShowPct: 5.4 },
  { semana: "S8", noShowPct: 4.2 },
];

// --- 7. Crecimiento de locales afiliados (Líneas) ---
const PARTNERS_GROWTH_DATA = [
  { mes: "Mar", locales: 4, crecimientoPct: 0.0 },
  { mes: "Abr", locales: 6, crecimientoPct: 50.0 },
  { mes: "May", locales: 8, crecimientoPct: 33.3 },
  { mes: "Jun", locales: 11, crecimientoPct: 37.5 },
  { mes: "Jul", locales: 15, crecimientoPct: 36.3 },
  { mes: "Ago", locales: 18, crecimientoPct: 20.0 },
];

function Dashboard() {
  const [period, setPeriod] = useState<Period>("30d");
  const [exportNotice, setExportNotice] = useState(false);
  const factor = PERIODS.find((p) => p.id === period)!.factor;

  const userReservations = useReservations();
  const userReviews = useReviews();

  // --- 5. Cumplimiento de Recursos (Semáforo) ---
  // Formula: (1 - (Fallas / Reservas realizadas)) * 100
  const resourceMetrics = useMemo(() => {
    const totalReservations = Math.round(451 * factor) + userReservations.length;
    const totalIssues = userReviews.reduce((acc, r) => acc + (r.issues ? r.issues.length : 0), 2);
    const score = Math.max(0, Math.min(100, Math.round((1 - totalIssues / totalReservations) * 100)));

    let status: "Green" | "Yellow" | "Red" = "Green";
    let label = "Excelente (Baja incidencia)";
    if (score < 50) {
      status = "Red";
      label = "Crítico (Múltiples fallas reportadas)";
    } else if (score < 90) {
      status = "Yellow";
      label = "Atención requerida";
    }

    return { score, status, label, totalIssues, totalReservations };
  }, [factor, userReservations, userReviews]);

  // --- 8. Disponibilidad del Sistema Uptime (Semáforo) ---
  // Formula: ((Total minutos - Inactivos) / Total minutos) * 100
  const uptimeScore = 99.98;

  const kpis = useMemo(
    () => [
      { icon: Users, label: "Usuarios activos", value: Math.round(450 * (factor / 4.1)).toLocaleString("es-EC"), delta: "+25% MoM", meta: "Fórmula MoM" },
      { icon: CalendarCheck, label: "Reservas confirmadas", value: (Math.round(180 * factor) + userReservations.length).toLocaleString("es-EC"), delta: "+31%", meta: "Tiempo real" },
      { icon: DollarSign, label: "Ingresos por comisión", value: "$" + Math.round(720 * factor * 0.12).toLocaleString("es-EC"), delta: "+28%", meta: "Comisión 12%" },
      { icon: Percent, label: "Tasa de conversión Premium", value: "18.6%", delta: "+3.5 pts", meta: "(Suscritos/Activos)*100", highlight: true },
      { icon: Star, label: "Satisfacción promedio", value: "4.9 / 5.0", delta: "+0.2 pts", meta: "312 Reseñas" },
      { icon: Store, label: "Locales afiliados (B2B)", value: "18 locales", delta: "+20% MoM", meta: "Red Guayaquil" },
    ],
    [factor, userReservations]
  );

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Módulo Analítico & Dashboard Gerencial
            </div>
            <h1 className="text-3xl font-display font-bold mt-1">Indicadores de Gestión FocusPlace</h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              Monitoreo operativo en tiempo real estructurado según los 8 procesos clave del servicio:
              captación, ocupación, calidad de recursos, monetización y nivel de servicio TI.
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
            <button
              onClick={handleExport}
              className="h-10 px-4 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold inline-flex items-center gap-2 hover:bg-secondary/80 transition"
            >
              <Download className="size-4" /> Exportar Reporte
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="bg-success/15 border border-success/30 text-success-foreground rounded-2xl p-4 text-xs flex items-center justify-between animate-in fade-in">
            <span className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" /> Reporte de indicadores generado y descargado exitosamente (.csv / .pdf).
            </span>
          </div>
        )}

        {/* --- KPI Grid Summary --- */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        {/* --- SEMÁFOROS (Indicadores 5 y 8) --- */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Indicador 5: Cumplimiento de Recursos (Semáforo) */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                  <AlertTriangle className="size-3.5 text-warning" /> Indicador 5 · Monitoreo de Calidad
                </div>
                <h3 className="font-display font-bold text-lg mt-0.5">Cumplimiento de Recursos</h3>
              </div>
              <SemaforoBadge status={resourceMetrics.status} />
            </div>

            <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
              <div>
                <div className="text-3xl font-display font-bold">{resourceMetrics.score}%</div>
                <div className="text-xs text-muted-foreground mt-0.5">Fórmula: (1 - (Fallas / Reservas)) * 100</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-foreground">{resourceMetrics.label}</div>
                <div className="text-muted-foreground mt-0.5">{resourceMetrics.totalIssues} fallas reportadas de {resourceMetrics.totalReservations} reservas</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Verde (&gt;90%): Operatividad excelente</span><strong className="text-success">&gt;90%</strong></div>
              <div className="flex justify-between"><span>Amarillo (50–89%): Reportes menores</span><strong className="text-warning">50–89%</strong></div>
              <div className="flex justify-between"><span>Rojo (&lt;50%): Alerta de mantenimiento</span><strong className="text-destructive">&lt;50%</strong></div>
            </div>
          </div>

          {/* Indicador 8: Disponibilidad del Sistema / Uptime TI (Semáforo) */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                  <Server className="size-3.5 text-primary" /> Indicador 8 · Soporte Técnico TI
                </div>
                <h3 className="font-display font-bold text-lg mt-0.5">Disponibilidad del Sistema (Uptime)</h3>
              </div>
              <SemaforoBadge status="Green" label="En línea (>99.9%)" />
            </div>

            <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
              <div>
                <div className="text-3xl font-display font-bold text-success">{uptimeScore}%</div>
                <div className="text-xs text-muted-foreground mt-0.5">Fórmula: ((Total Min - Inactivos) / Total Min) * 100</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-success">Estado Óptimo</div>
                <div className="text-muted-foreground mt-0.5">Latencia API: 42ms · 0 caídas este mes</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Verde (&gt;99.9%): Servidor 100% operativo</span><strong className="text-success">&gt;99.9%</strong></div>
              <div className="flex justify-between"><span>Servicios activos: Pasarela, QR & Notificaciones</span><strong className="text-foreground">OK</strong></div>
            </div>
          </div>
        </div>

        {/* --- GRÁFICOS DE BARRAS (Indicadores 1, 2, 3 y 4) --- */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Indicador 1: Crecimiento de Usuarios Activos */}
          <ChartCard
            title="1. Crecimiento de Usuarios Activos (MoM)"
            subtitle="Medición al cierre de cada mes (gráfico discreto de barras)"
            formula="((Mes actual - Mes anterior) / Mes anterior) * 100"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={USER_GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="mes" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip content={<CustomTooltip unit="usuarios" />} />
                <Bar dataKey="activos" radius={[6, 6, 0, 0]} fill="oklch(0.42 0.09 165)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Indicador 2: Tasa de Ocupación de Espacios */}
          <ChartCard
            title="2. Tasa de Ocupación de Espacios (%)"
            subtitle="Comparación del porcentaje de ocupación mensual"
            formula="(Reservados / Disponibles) * 100"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={OCCUPANCY_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="mes" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Bar dataKey="ocupacionPct" radius={[6, 6, 0, 0]} fill="oklch(0.78 0.16 75)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Indicador 3: Nivel de Satisfacción del Usuario */}
          <ChartCard
            title="3. Nivel de Satisfacción del Usuario (Rating)"
            subtitle="Calificación promedio otorgada vs. volumen de reseñas"
            formula="Suma de calificaciones / Número de reseñas"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={SATISFACTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="mes" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} domain={[3, 5]} />
                <Tooltip content={<CustomTooltip unit="★" />} />
                <Bar dataKey="rating" radius={[6, 6, 0, 0]} fill="oklch(0.65 0.18 140)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Indicador 4: Tasa de Conversión a Premium */}
          <ChartCard
            title="4. Tasa de Conversión a Premium (%)"
            subtitle="Conversión comercial de usuarios gratuitos a suscriptores"
            formula="(Suscritos / Usuarios activos) * 100"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CONVERSION_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="mes" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} domain={[0, 25]} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Bar dataKey="tasaPct" radius={[6, 6, 0, 0]} fill="oklch(0.55 0.2 260)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* --- GRÁFICOS DE LÍNEAS (Indicadores 6 y 7) --- */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Indicador 6: Tasa de No-shows / Ausencias */}
          <ChartCard
            title="6. Tasa de No-shows / Ausencias (%)"
            subtitle="Evolución temporal limpia de la reducción de ausencias"
            formula="(No presentadas / Confirmadas) * 100"
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={NOSHOW_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="semana" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} domain={[0, 25]} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Line
                  type="monotone"
                  dataKey="noShowPct"
                  stroke="oklch(0.62 0.22 25)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Indicador 7: Crecimiento de Locales Afiliados */}
          <ChartCard
            title="7. Crecimiento de Locales Afiliados (Red B2B)"
            subtitle="Tendencia de expansión de la red de establecimientos"
            formula="((Actuales - Anteriores) / Anteriores) * 100"
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={PARTNERS_GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="mes" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip content={<CustomTooltip unit="locales" />} />
                <Line
                  type="monotone"
                  dataKey="locales"
                  stroke="oklch(0.42 0.09 165)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* --- Tabla de Desempeño por Aliado --- */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border font-display font-bold text-lg flex items-center justify-between">
            <span>Rendimiento por Local Comercial Afiliado</span>
            <span className="text-xs text-muted-foreground font-normal">Sincronización en vivo</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium">Establecimiento</th>
                  <th className="text-left px-5 py-2.5 font-medium">Categoría</th>
                  <th className="text-right px-5 py-2.5 font-medium">Reservas Mes</th>
                  <th className="text-right px-5 py-2.5 font-medium">Ocupación %</th>
                  <th className="text-right px-5 py-2.5 font-medium">Comisión Generada</th>
                  <th className="text-right px-5 py-2.5 font-medium">Satisfacción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SPACES.map((s, i) => {
                  const reservas = [142, 118, 94, 76, 52, 41][i] ?? 30;
                  const ocupacionPct = Math.round((s.occupied / s.capacity) * 100);
                  const comision = "$" + ([284, 412, 168, 224, 112, 98][i] ?? 70);

                  return (
                    <tr key={s.id} className="hover:bg-muted/40 transition">
                      <td className="px-5 py-3 font-medium">{s.name}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{s.type}</td>
                      <td className="px-5 py-3 text-right font-semibold">{reservas}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${ocupacionPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{ocupacionPct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold">{comision}</td>
                      <td className="px-5 py-3 text-right text-amber-500 font-semibold">★ {s.rating}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
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
      className={`rounded-2xl p-4 border transition ${
        highlight ? "bg-amber-500/10 border-amber-500/30" : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`size-9 rounded-lg grid place-items-center ${
            highlight ? "bg-amber-500/20 text-amber-600" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-4" />
        </div>
        <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
          {delta}
        </span>
      </div>
      <div className="text-2xl font-display font-bold mt-3">{value}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="text-[10px] text-muted-foreground/80 font-mono mt-1">{meta}</div>
    </div>
  );
}

function SemaforoBadge({ status, label }: { status: "Green" | "Yellow" | "Red"; label?: string }) {
  const styles = {
    Green: "bg-success/15 text-success border-success/30",
    Yellow: "bg-warning/20 text-warning-foreground border-warning/40",
    Red: "bg-destructive/15 text-destructive border-destructive/30",
  };

  const defaultLabels = {
    Green: "Verde (>90%)",
    Yellow: "Amarillo (50-89%)",
    Red: "Rojo (<50%)",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${styles[status]}`}
    >
      <span
        className={`size-2 rounded-full ${
          status === "Green"
            ? "bg-success animate-pulse"
            : status === "Yellow"
            ? "bg-warning"
            : "bg-destructive"
        }`}
      />
      {label || defaultLabels[status]}
    </span>
  );
}

function ChartCard({
  title,
  subtitle,
  formula,
  children,
}: {
  title: string;
  subtitle: string;
  formula: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
      <div>
        <h3 className="font-display font-bold text-base">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <div className="text-[10px] font-mono text-primary/80 mt-0.5">Fórmula: {formula}</div>
      </div>
      <div className="pt-2">{children}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, unit }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-2.5 shadow-xl text-xs space-y-1">
        <div className="font-bold">{label}</div>
        <div className="text-primary font-semibold">
          {payload[0].value} {unit}
        </div>
      </div>
    );
  }
  return null;
}

