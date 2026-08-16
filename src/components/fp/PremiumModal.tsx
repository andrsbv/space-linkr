import { useState } from "react";
import { Sparkles, Check, X, ShieldCheck, Zap, Coffee, Bell, ArrowRight } from "lucide-react";
import { useUserTier, setUserTier } from "@/lib/focusplace-store";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const currentTier = useUserTier();
  const [billingPlan, setBillingPlan] = useState<"monthly" | "yearly">("yearly");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTogglePremium = () => {
    if (currentTier === "premium") {
      setUserTier("free");
      onClose();
    } else {
      setUserTier("premium");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-primary to-emerald-700 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="size-36" />
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 size-8 rounded-full bg-black/20 hover:bg-black/40 grid place-items-center transition text-white"
          >
            <X className="size-4" />
          </button>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest bg-black/25 px-3 py-1 rounded-full text-amber-200 border border-amber-300/30">
            <Sparkles className="size-3.5" /> FocusPlace Pass
          </span>
          <h2 className="font-display font-bold text-2xl mt-2 leading-tight">FocusPlace Premium</h2>
          <p className="text-xs opacity-90 mt-1">
            Potencia tu productividad con reservas ilimitadas, descuentos VIP y cero esperas.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="inline-flex size-14 rounded-full bg-success/20 text-success items-center justify-center">
                <Check className="size-8 animate-bounce" />
              </div>
              <h3 className="font-display font-bold text-xl">¡Bienvenido a FocusPlace Premium!</h3>
              <p className="text-xs text-muted-foreground">
                Tus beneficios ya están activos en tu cuenta. ¡Disfruta tu espacio de estudio!
              </p>
            </div>
          ) : (
            <>
              {/* Toggle billing */}
              <div className="bg-muted p-1 rounded-full flex items-center text-xs font-semibold">
                <button
                  onClick={() => setBillingPlan("monthly")}
                  className={`flex-1 py-2 rounded-full transition ${
                    billingPlan === "monthly" ? "bg-card shadow text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Mensual ($4.99/mes)
                </button>
                <button
                  onClick={() => setBillingPlan("yearly")}
                  className={`flex-1 py-2 rounded-full transition flex items-center justify-center gap-1 ${
                    billingPlan === "yearly" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                  }`}
                >
                  Anual ($3.33/mes) <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">Ahorra 33%</span>
                </button>
              </div>

              {/* Benefits list */}
              <div className="space-y-3 text-xs">
                <BenefitItem
                  icon={Zap}
                  title="Reservas prioritarias inmediatas"
                  desc="Asegura mesas grupales y cubículos en horarios pico antes que los demás."
                />
                <BenefitItem
                  icon={Coffee}
                  title="20% OFF en consumo constante"
                  desc="Descuento automático en cafés, bocadillos y consumiciones en la red de aliados."
                />
                <BenefitItem
                  icon={Bell}
                  title="Alertas de mesas liberadas"
                  desc="Notificación push inmediata cuando se desocupa un espacio en tu local favorito."
                />
                <BenefitItem
                  icon={ShieldCheck}
                  title="Cancelaciones sin penalidad"
                  desc="Libera o re-programa tus cupos hasta 5 minutos antes sin perder beneficios."
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {currentTier === "premium" ? (
                  <button
                    onClick={handleTogglePremium}
                    className="w-full h-11 rounded-xl bg-destructive/10 text-destructive border border-destructive/30 font-semibold text-xs hover:bg-destructive/20 transition"
                  >
                    Desactivar Membresía Premium (Volver a Básico Gratis)
                  </button>
                ) : (
                  <button
                    onClick={handleTogglePremium}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-primary to-emerald-600 text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-95 transition flex items-center justify-center gap-2"
                  >
                    Activar Plan Premium Ahora <ArrowRight className="size-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
        <Icon className="size-4" />
      </div>
      <div>
        <div className="font-semibold text-foreground">{title}</div>
        <div className="text-muted-foreground text-[11px] leading-tight mt-0.5">{desc}</div>
      </div>
    </div>
  );
}
