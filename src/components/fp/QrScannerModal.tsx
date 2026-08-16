import { useState } from "react";
import { QrCode, Search, CheckCircle2, X, AlertCircle, Sparkles, Tag, Users } from "lucide-react";
import {
  useReservations,
  updateReservation,
  getMergedSpace,
  updateSpaceInventory,
  type Reservation,
} from "@/lib/focusplace-store";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId?: string;
}

export function QrScannerModal({ isOpen, onClose, spaceId = "sweet-urdesa" }: QrScannerModalProps) {
  const reservations = useReservations();
  const [inputCode, setInputCode] = useState("");
  const [scannedReservation, setScannedReservation] = useState<Reservation | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter pending reservations for this space or all spaces
  const pendingForSpace = reservations.filter(
    (r) => (r.spaceId === spaceId || !spaceId) && r.status === "Pendiente"
  );

  const handleValidate = (resToValidate: Reservation) => {
    // Perform check-in update
    updateReservation(resToValidate.id, {
      status: "Check-in realizado",
      checkedInAt: Date.now(),
    });

    // Automatically update space occupancy
    const currentSpace = getMergedSpace(resToValidate.spaceId);
    if (currentSpace) {
      updateSpaceInventory(resToValidate.spaceId, {
        occupied: Math.min(currentSpace.capacity, currentSpace.occupied + resToValidate.people),
      });
    }

    setScannedReservation(resToValidate);
    setSuccessMessage(`Check-in validado exitosamente para ${resToValidate.people} persona(s). Cupón ${resToValidate.couponCode} activado.`);
    setErrorMessage(null);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const code = inputCode.trim().toUpperCase();
    const found = reservations.find(
      (r) => r.id.toUpperCase() === code || r.couponCode.toUpperCase() === code
    );

    if (!found) {
      setErrorMessage("Código de reserva o cupón no encontrado. Verifica la entrada.");
      setSuccessMessage(null);
      setScannedReservation(null);
      return;
    }

    if (found.status === "Check-in realizado") {
      setErrorMessage(`El código ${found.id} ya fue canjeado anteriormente.`);
      setSuccessMessage(null);
      setScannedReservation(found);
      return;
    }

    handleValidate(found);
  };

  const resetModal = () => {
    setScannedReservation(null);
    setSuccessMessage(null);
    setErrorMessage(null);
    setInputCode("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-[oklch(0.32_0.07_165)] text-primary-foreground p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/15 grid place-items-center">
              <QrCode className="size-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg leading-tight">Escáner de Validación QR</h2>
              <p className="text-xs opacity-85">Validación en tiempo real para Aliados Comerciales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Success state */}
          {successMessage && scannedReservation && (
            <div className="bg-success/15 border border-success/30 rounded-2xl p-5 text-center space-y-3">
              <div className="inline-flex size-14 rounded-full bg-success/20 text-success items-center justify-center">
                <CheckCircle2 className="size-8 animate-bounce" />
              </div>
              <h3 className="font-display font-bold text-xl text-success-foreground">¡Acceso y Cupón Confirmados!</h3>
              <p className="text-xs text-muted-foreground">{successMessage}</p>

              <div className="bg-card border border-border rounded-xl p-3 text-left space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Reserva:</span><strong className="font-mono">{scannedReservation.id}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Horario:</span><span>{scannedReservation.start} – {scannedReservation.end}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Personas:</span><span>{scannedReservation.people}</span></div>
                <div className="flex justify-between text-accent font-semibold"><span className="text-muted-foreground">Cupón 10% OFF:</span><span className="font-mono">{scannedReservation.couponCode}</span></div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={resetModal}
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition"
                >
                  Escanear otro código
                </button>
                <button
                  onClick={onClose}
                  className="h-10 px-4 rounded-xl bg-muted text-muted-foreground font-medium text-xs hover:bg-secondary transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Main scanner simulation interface */}
          {!successMessage && (
            <>
              {/* Camera Simulation Viewport */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 h-52 overflow-hidden flex flex-col items-center justify-center text-center p-4">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/10 animate-pulse pointer-events-none" />
                
                {/* Simulated scanner viewfinder box */}
                <div className="relative size-36 border-2 border-primary/80 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                  <div className="absolute -top-1 -left-1 size-4 border-t-2 border-l-2 border-primary" />
                  <div className="absolute -top-1 -right-1 size-4 border-t-2 border-r-2 border-primary" />
                  <div className="absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2 border-primary" />
                  <div className="absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 border-primary" />
                  <QrCode className="size-16 text-primary/40 animate-pulse" />
                </div>

                <div className="mt-3 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success animate-ping" /> Cámara activa — Apunta al QR del usuario
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Manual Input Search */}
              <form onSubmit={handleManualSearch} className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  O ingresa el código manualmente (Reserva o Cupón):
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3.5 h-11 border border-border focus-within:border-primary">
                    <Search className="size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Ej. RSV-8A9X2 o FP10-AX23"
                      className="bg-transparent flex-1 outline-none text-xs font-mono placeholder:font-sans placeholder:text-muted-foreground"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition inline-flex items-center gap-1.5"
                  >
                    Validar
                  </button>
                </div>
              </form>

              {/* Quick Select Pending Reservations for Demo */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Reservas pendientes en tu local:</span>
                  <span className="text-primary font-semibold">{pendingForSpace.length} disponibles</span>
                </div>

                {pendingForSpace.length === 0 ? (
                  <div className="text-center py-4 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                    No hay reservas pendientes de check-in en este momento.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {pendingForSpace.map((r) => (
                      <div
                        key={r.id}
                        className="bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/40 rounded-xl p-2.5 flex items-center justify-between text-xs transition cursor-pointer"
                        onClick={() => handleValidate(r)}
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold flex items-center gap-2">
                            <span>Reserva: <strong className="font-mono">{r.id}</strong></span>
                            <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              <Users className="size-3" /> {r.people} p.
                            </span>
                          </div>
                          <div className="text-muted-foreground text-[11px]">
                            Horario: {r.start} – {r.end} · Cupón: <code className="font-mono text-accent">{r.couponCode}</code>
                          </div>
                        </div>
                        <button className="h-8 px-3 rounded-lg bg-primary text-primary-foreground font-medium text-[11px] hover:bg-primary/90 shrink-0">
                          Simular Scan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
