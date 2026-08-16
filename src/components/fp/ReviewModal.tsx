import { useState } from "react";
import { Star, X, Check, Wifi, Plug, Volume2, Snowflake, Send, AlertTriangle } from "lucide-react";
import { addReview, useUserTier } from "@/lib/focusplace-store";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
}

const ISSUE_OPTIONS = [
  { id: "wifi", label: "WiFi lento / inestable", Icon: Wifi },
  { id: "enchufes", label: "Faltan enchufes", Icon: Plug },
  { id: "ruido", label: "Mucho ruido", Icon: Volume2 },
  { id: "ac", label: "Falla Aire Acondicionado", Icon: Snowflake },
];

export function ReviewModal({ isOpen, onClose, spaceId, spaceName }: ReviewModalProps) {
  const userTier = useUserTier();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("Estudiante FocusPlace");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleIssue = (issueId: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issueId) ? prev.filter((i) => i !== issueId) : [...prev, issueId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      spaceId,
      userName: userName.trim() || "Usuario FocusPlace",
      userTier,
      rating,
      comment,
      issues: selectedIssues,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-[oklch(0.32_0.07_165)] text-primary-foreground p-5 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">Calificar Experiencia</h2>
            <p className="text-xs opacity-85">{spaceName}</p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex size-14 rounded-full bg-success/20 text-success items-center justify-center">
              <Check className="size-8 animate-bounce" />
            </div>
            <h3 className="font-display font-bold text-xl">¡Gracias por tu reseña!</h3>
            <p className="text-xs text-muted-foreground">
              Tu opinión ayuda a mantener la calidad de los espacios afiliados en FocusPlace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Rating Stars */}
            <div className="text-center space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                ¿Qué tal tu estadía?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-amber-400 hover:scale-110 transition transform"
                  >
                    <Star
                      className={`size-8 ${
                        star <= (hoverRating ?? rating) ? "fill-amber-400" : "fill-muted text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Tu Nombre / Apodo:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-xs outline-none focus:border-primary"
              />
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Tu Reseña:</label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe tu opinión sobre la iluminación, silencio, comodidad o café…"
                className="w-full p-3 rounded-xl bg-muted border border-border text-xs outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Report Resource Issues (Quality Monitoring) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="size-3.5 text-warning" /> ¿Reportas alguna falla en el espacio? (Opcional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_OPTIONS.map((opt) => {
                  const active = selectedIssues.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleIssue(opt.id)}
                      className={`p-2 rounded-xl border text-left text-xs font-medium flex items-center gap-2 transition ${
                        active
                          ? "bg-destructive/10 border-destructive text-destructive"
                          : "bg-muted/50 border-border text-muted-foreground hover:border-muted"
                      }`}
                    >
                      <opt.Icon className="size-3.5 shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-xl bg-muted hover:bg-secondary text-muted-foreground text-xs font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center justify-center gap-1.5"
              >
                <Send className="size-3.5" /> Enviar Reseña
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
