import { Link } from "@tanstack/react-router";
import { type Space, occupancyLevel } from "@/lib/focusplace-data";

export function MiniMap({ spaces, activeId }: { spaces: Space[]; activeId?: string }) {
  return (
    <div className="relative w-full aspect-[5/4] rounded-2xl overflow-hidden border border-border bg-[oklch(0.95_0.02_165)]">
      {/* faux streets */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="oklch(0.88 0.02 165)" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100" height="80" fill="url(#grid)" />
        <path d="M0,40 Q30,30 60,45 T100,38" stroke="oklch(0.85 0.03 165)" strokeWidth="1.5" fill="none" />
        <path d="M25,0 L30,80" stroke="oklch(0.85 0.03 165)" strokeWidth="1" fill="none" />
        <path d="M70,0 L65,80" stroke="oklch(0.85 0.03 165)" strokeWidth="1" fill="none" />
        <circle cx="50" cy="50" r="3" fill="oklch(0.42 0.09 165)" opacity="0.2" />
        <circle cx="50" cy="50" r="1.2" fill="oklch(0.42 0.09 165)" />
      </svg>
      <div className="absolute top-2 left-2 text-[10px] bg-card/90 px-2 py-1 rounded-full font-medium">Tú estás aquí</div>
      {spaces.map((s) => {
        const lvl = occupancyLevel(s);
        const color =
          lvl === "Disponible" ? "bg-success" : lvl === "Medio" ? "bg-warning" : "bg-destructive";
        const active = s.id === activeId;
        return (
          <Link
            key={s.id}
            to="/space/$id"
            params={{ id: s.id }}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <div className={`group flex flex-col items-center ${active ? "scale-110" : ""}`}>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow ${color} whitespace-nowrap`}>
                {s.name.split("—")[0].trim()}
              </div>
              <div className={`size-3 rounded-full ${color} border-2 border-white shadow -mt-0.5`} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
