import { Link } from "@tanstack/react-router";
import { Star, MapPin, Wifi, Plug, Volume2, Coffee, Snowflake, Users } from "lucide-react";
import { AMENITY_LABELS, type Amenity, type Space, occupancyColor, occupancyLevel } from "@/lib/focusplace-data";

const ICONS: Record<Amenity, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi, enchufes: Plug, silencio: Volume2, cafe: Coffee, ac: Snowflake, grupal: Users,
};

export function SpaceCard({ s }: { s: Space }) {
  return (
    <Link
      to="/space/$id"
      params={{ id: s.id }}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={s.image}
          alt={s.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${occupancyColor(s)}`}>
          {occupancyLevel(s)} · {s.capacity - s.occupied} libres
        </div>
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Star className="size-3 fill-accent text-accent" /> {s.rating}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.type}</div>
            <h3 className="font-display font-bold leading-tight">{s.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{s.pricePerHour === 0 ? "Gratis" : `$${s.pricePerHour.toFixed(2)}/h`}</div>
            <div className="text-[11px] text-muted-foreground">{s.distanceKm} km</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" /> {s.address}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {s.amenities.slice(0, 4).map((a) => {
            const I = ICONS[a];
            return (
              <span key={a} className="inline-flex items-center gap-1 text-[11px] bg-muted px-2 py-1 rounded-full text-muted-foreground">
                <I className="size-3" /> {AMENITY_LABELS[a]}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
