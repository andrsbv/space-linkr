export type Amenity = "wifi" | "enchufes" | "silencio" | "cafe" | "ac" | "grupal";

export type Space = {
  id: string;
  name: string;
  type: "Cafetería" | "Coworking" | "Biblioteca" | "Local";
  address: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  pricePerHour: number;
  capacity: number;
  occupied: number;
  amenities: Amenity[];
  image: string;
  description: string;
  hours: string;
  // map coords in % of container
  x: number;
  y: number;
  // Underused hours window — para resaltar oferta del aliado
  lowDemandHours: string;
};

export const AMENITY_LABELS: Record<Amenity, string> = {
  wifi: "WiFi rápido",
  enchufes: "Enchufes",
  silencio: "Ambiente silencioso",
  cafe: "Café incluido",
  ac: "Aire acondicionado",
  grupal: "Mesas grupales",
};

export const SPACES: Space[] = [
  {
    id: "sweet-urdesa",
    name: "Sweet & Coffee — Urdesa",
    type: "Cafetería",
    address: "Av. Víctor E. Estrada 712, Urdesa",
    distanceKm: 0.6,
    rating: 4.7,
    reviews: 312,
    pricePerHour: 0,
    capacity: 24,
    occupied: 9,
    amenities: ["wifi", "enchufes", "cafe", "ac"],
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=70",
    description:
      "Mesas amplias con buena luz natural, ideal para sesiones de estudio cortas. Consumo mínimo $3.",
    hours: "07:00 – 22:00",
    x: 28, y: 42,
    lowDemandHours: "14:00 – 17:00",
  },
  {
    id: "cowork-samborondon",
    name: "FocusHub Coworking",
    type: "Coworking",
    address: "Av. Samborondón Km 1.5",
    distanceKm: 1.4,
    rating: 4.9,
    reviews: 188,
    pricePerHour: 3.5,
    capacity: 40,
    occupied: 31,
    amenities: ["wifi", "enchufes", "silencio", "ac", "grupal"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=70",
    description:
      "Cubículos privados y salas grupales. Reserva por hora con check-in QR en recepción.",
    hours: "06:00 – 23:00",
    x: 62, y: 30,
    lowDemandHours: "09:00 – 12:00",
  },
  {
    id: "cafe-velez",
    name: "Café Vélez — Centro",
    type: "Cafetería",
    address: "Rocafuerte 530 y 9 de Octubre",
    distanceKm: 2.1,
    rating: 4.5,
    reviews: 421,
    pricePerHour: 0,
    capacity: 30,
    occupied: 6,
    amenities: ["wifi", "enchufes", "cafe"],
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=70",
    description:
      "Ambiente clásico con segundo piso tranquilo. WiFi para clientes con consumo.",
    hours: "08:00 – 21:00",
    x: 45, y: 68,
    lowDemandHours: "10:00 – 12:30",
  },
  {
    id: "biblio-norte",
    name: "Biblioteca Norte Privada",
    type: "Biblioteca",
    address: "Cdla. Kennedy Norte, Mz. 4",
    distanceKm: 3.0,
    rating: 4.8,
    reviews: 96,
    pricePerHour: 1.5,
    capacity: 50,
    occupied: 12,
    amenities: ["wifi", "enchufes", "silencio", "ac"],
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=70",
    description: "Cubículos individuales con luz cálida. Reglas estrictas de silencio.",
    hours: "08:00 – 20:00",
    x: 75, y: 58,
    lowDemandHours: "08:00 – 11:00",
  },
  {
    id: "rooftop-alborada",
    name: "Rooftop Co · Alborada",
    type: "Local",
    address: "Av. Rodolfo Baquerizo, Alborada",
    distanceKm: 4.2,
    rating: 4.4,
    reviews: 54,
    pricePerHour: 2.0,
    capacity: 18,
    occupied: 2,
    amenities: ["wifi", "enchufes", "grupal", "cafe"],
    image: "https://images.unsplash.com/photo-1542315192-1f61a1792f33?w=800&q=70",
    description:
      "Espacio nuevo, mesas grupales para trabajo colaborativo. Promo de apertura activa.",
    hours: "09:00 – 22:00",
    x: 18, y: 78,
    lowDemandHours: "09:00 – 13:00",
  },
  {
    id: "juan-valdez-malecon",
    name: "Juan Valdez — Malecón",
    type: "Cafetería",
    address: "Malecón 2000, frente al MAAC",
    distanceKm: 5.0,
    rating: 4.6,
    reviews: 540,
    pricePerHour: 0,
    capacity: 28,
    occupied: 24,
    amenities: ["wifi", "cafe", "ac"],
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=70",
    description: "Vista al río, ideal para reuniones cortas. Pocos enchufes disponibles.",
    hours: "07:00 – 23:00",
    x: 55, y: 50,
    lowDemandHours: "15:00 – 17:00",
  },
];

export const getSpace = (id: string) => SPACES.find((s) => s.id === id);

export const occupancyLevel = (s: Space): "Disponible" | "Medio" | "Lleno" => {
  const r = s.occupied / s.capacity;
  if (r < 0.4) return "Disponible";
  if (r < 0.85) return "Medio";
  return "Lleno";
};

export const occupancyColor = (s: Space) => {
  const l = occupancyLevel(s);
  if (l === "Disponible") return "bg-success text-success-foreground";
  if (l === "Medio") return "bg-warning text-warning-foreground";
  return "bg-destructive text-destructive-foreground";
};
