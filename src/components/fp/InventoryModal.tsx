import { useState, useEffect } from "react";
import { Sliders, X, Check, Store, Clock, Users, Sparkles } from "lucide-react";
import { getMergedSpace, updateSpaceInventory } from "@/lib/focusplace-store";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId?: string;
}

export function InventoryModal({ isOpen, onClose, spaceId = "sweet-urdesa" }: InventoryModalProps) {
  const currentSpace = getMergedSpace(spaceId);

  const [capacity, setCapacity] = useState(currentSpace?.capacity || 24);
  const [occupied, setOccupied] = useState(currentSpace?.occupied || 9);
  const [lowDemandHours, setLowDemandHours] = useState(currentSpace?.lowDemandHours || "14:00 – 17:00");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentSpace) {
      setCapacity(currentSpace.capacity);
      setOccupied(currentSpace.occupied);
      setLowDemandHours(currentSpace.lowDemandHours);
    }
  }, [spaceId, isOpen]);

  if (!isOpen || !currentSpace) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSpaceInventory(spaceId, {
      capacity: Number(capacity),
      occupied: Math.min(Number(capacity), Number(occupied)),
      lowDemandHours,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const occupancyRatio = Math.round((occupied / capacity) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-[oklch(0.32_0.07_165)] text-primary-foreground p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/15 grid place-items-center">
              <Sliders className="size-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg leading-tight">Administrar Inventario y Cupos</h2>
              <p className="text-xs opacity-85">{currentSpace.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {savedSuccess && (
            <div className="bg-success/15 border border-success/30 text-success rounded-xl p-3 text-xs flex items-center justify-center gap-2 font-semibold">
              <Check className="size-4" /> ¡Inventario actualizado en tiempo real!
            </div>
          )}

          {/* Occupancy preview */}
          <div className="bg-muted/60 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Ocupación Actual:</span>
              <span className="text-primary">{occupied} de {capacity} mesas ocupadas ({occupancyRatio}%)</span>
            </div>
            <div className="h-3 rounded-full bg-background overflow-hidden border border-border">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, occupancyRatio)}%` }}
              />
            </div>
          </div>

          {/* Capacity field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Store className="size-3.5" /> Capacidad Total de Mesas/Puestos
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full h-11 px-4 rounded-xl bg-muted border border-border text-sm font-semibold outline-none focus:border-primary"
            />
          </div>

          {/* Occupied field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Users className="size-3.5" /> Ocupación Presente (En Local)
            </label>
            <input
              type="number"
              min={0}
              max={capacity}
              value={occupied}
              onChange={(e) => setOccupied(Number(e.target.value))}
              className="w-full h-11 px-4 rounded-xl bg-muted border border-border text-sm font-semibold outline-none focus:border-primary"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOccupied(Math.max(0, occupied - 1))}
                className="flex-1 py-1 text-xs bg-muted border border-border rounded-lg hover:bg-secondary font-medium"
              >
                -1 Mesa
              </button>
              <button
                type="button"
                onClick={() => setOccupied(Math.min(capacity, occupied + 1))}
                className="flex-1 py-1 text-xs bg-muted border border-border rounded-lg hover:bg-secondary font-medium"
              >
                +1 Mesa
              </button>
              <button
                type="button"
                onClick={() => setOccupied(capacity)}
                className="flex-1 py-1 text-xs bg-destructive/15 text-destructive border border-destructive/20 rounded-lg font-medium hover:bg-destructive/20"
              >
                Marcar Lleno
              </button>
            </div>
          </div>

          {/* Low demand hours field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5" /> Ventana de Horarios de Baja Demanda
            </label>
            <input
              type="text"
              value={lowDemandHours}
              onChange={(e) => setLowDemandHours(e.target.value)}
              placeholder="Ej. 14:00 – 17:00"
              className="w-full h-11 px-4 rounded-xl bg-muted border border-border text-sm font-semibold outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground">
              En esta franja horaria se ofrecerán cupones y promociones automáticas para atraer estudiantes.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-muted hover:bg-secondary text-muted-foreground text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center justify-center gap-1.5"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
