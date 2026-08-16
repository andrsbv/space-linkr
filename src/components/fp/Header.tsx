import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, MapPin, User, Sparkles } from "lucide-react";
import { useReservations, useUserTier } from "@/lib/focusplace-store";
import { PremiumModal } from "@/components/fp/PremiumModal";

export function Header() {
  const reservations = useReservations();
  const userTier = useUserTier();
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);

  const pending = reservations.filter((r) => r.status === "Pendiente").length;

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold shadow-sm shadow-primary/20">
              F
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-lg flex items-center gap-1.5">
                FocusPlace
                {userTier === "premium" && (
                  <span className="text-[10px] bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Sparkles className="size-2.5" /> PRO
                  </span>
                )}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">
                Espacios para enfocarte
              </div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavLink to="/">Explorar</NavLink>
            <NavLink to="/mis-reservas">Mis reservas{pending ? ` (${pending})` : ""}</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/aliado">Soy aliado</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {/* Premium Button */}
            <button
              onClick={() => setIsPremiumOpen(true)}
              className={`h-9 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                userTier === "premium"
                  ? "bg-amber-500/15 text-amber-600 border border-amber-500/30 hover:bg-amber-500/25"
                  : "bg-gradient-to-r from-amber-500 to-primary text-white hover:opacity-95 shadow-sm"
              }`}
            >
              <Sparkles className="size-3.5" />
              {userTier === "premium" ? "Membresía PRO" : "Plan Premium"}
            </button>

            <Link
              to="/mis-reservas"
              className="relative inline-flex size-9 items-center justify-center rounded-full hover:bg-muted transition"
              aria-label="Notificaciones"
            >
              <Bell className="size-4" />
              {pending > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold grid place-items-center">
                  {pending}
                </span>
              )}
            </Link>
            <button className="hidden sm:inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-3 h-9 text-sm font-medium hover:bg-secondary/80 transition">
              <MapPin className="size-3.5" />
              Guayaquil
            </button>
            <div
              onClick={() => setIsPremiumOpen(true)}
              className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center cursor-pointer hover:bg-primary/20 transition relative"
            >
              <User className="size-4" />
              {userTier === "premium" && (
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-amber-500 border-2 border-background" />
              )}
            </div>
          </div>
        </div>
      </header>

      <PremiumModal isOpen={isPremiumOpen} onClose={() => setIsPremiumOpen(false)} />
    </>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
      activeProps={{ className: "px-3 py-2 rounded-full bg-primary/10 text-primary font-medium" }}
    >
      {children}
    </Link>
  );
}

