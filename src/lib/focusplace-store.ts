import { useEffect, useState } from "react";
import { SPACES, type Space } from "./focusplace-data";

export type Reservation = {
  id: string;
  spaceId: string;
  spaceName: string;
  date: string; // ISO date
  start: string; // HH:mm
  end: string;
  people: number;
  status: "Pendiente" | "Check-in realizado" | "Cancelada";
  couponCode: string; // QR de descuento
  createdAt: number;
  checkedInAt?: number;
};

export type Review = {
  id: string;
  spaceId: string;
  userName: string;
  userTier: "free" | "premium";
  rating: number; // 1-5
  comment: string;
  issues: string[]; // e.g. ["wifi", "enchufes"]
  createdAt: number;
};

export type SpaceOverride = {
  capacity?: number;
  occupied?: number;
  isOpen?: boolean;
  lowDemandHours?: string;
};

const KEY_RSV = "focusplace.reservations.v1";
const KEY_REVIEWS = "focusplace.reviews.v1";
const KEY_SPACES = "focusplace.spaces_override.v1";
const KEY_TIER = "focusplace.user_tier.v1";

// --- RESERVATIONS ---
function readReservations(): Reservation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY_RSV) || "[]");
  } catch {
    return [];
  }
}
function writeReservations(r: Reservation[]) {
  localStorage.setItem(KEY_RSV, JSON.stringify(r));
  window.dispatchEvent(new Event("focusplace:reservations"));
}

export function useReservations() {
  const [list, setList] = useState<Reservation[]>([]);
  useEffect(() => {
    setList(readReservations());
    const h = () => setList(readReservations());
    window.addEventListener("focusplace:reservations", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("focusplace:reservations", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return list;
}

export function addReservation(r: Omit<Reservation, "id" | "createdAt" | "status" | "couponCode">) {
  const id = "RSV-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const couponCode = "FP10-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  const full: Reservation = {
    ...r,
    id,
    couponCode,
    status: "Pendiente",
    createdAt: Date.now(),
  };
  const list = readReservations();
  list.unshift(full);
  writeReservations(list);
  return full;
}

export function updateReservation(id: string, patch: Partial<Reservation>) {
  const list = readReservations().map((x) => (x.id === id ? { ...x, ...patch } : x));
  writeReservations(list);
}

export function getReservation(id: string): Reservation | undefined {
  return readReservations().find((x) => x.id === id || x.couponCode === id);
}

// --- REVIEWS ---
const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    spaceId: "sweet-urdesa",
    userName: "Carlos M.",
    userTier: "premium",
    rating: 5,
    comment: "Excelente lugar para trabajar en la tarde. Buen café y WiFi muy veloz.",
    issues: [],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "rev-2",
    spaceId: "sweet-urdesa",
    userName: "Andrea G.",
    userTier: "free",
    rating: 4,
    comment: "Muy limpio y ordenado. El cupón de descuento por check-in funcionó sin problemas.",
    issues: [],
    createdAt: Date.now() - 86400000 * 5,
  },
];

function readReviews(): Review[] {
  if (typeof window === "undefined") return INITIAL_REVIEWS;
  try {
    const raw = localStorage.getItem(KEY_REVIEWS);
    return raw ? JSON.parse(raw) : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
}

function writeReviews(r: Review[]) {
  localStorage.setItem(KEY_REVIEWS, JSON.stringify(r));
  window.dispatchEvent(new Event("focusplace:reviews"));
}

export function useReviews(spaceId?: string) {
  const [list, setList] = useState<Review[]>([]);
  useEffect(() => {
    const fetch = () => {
      const all = readReviews();
      setList(spaceId ? all.filter((x) => x.spaceId === spaceId) : all);
    };
    fetch();
    window.addEventListener("focusplace:reviews", fetch);
    window.addEventListener("storage", fetch);
    return () => {
      window.removeEventListener("focusplace:reviews", fetch);
      window.removeEventListener("storage", fetch);
    };
  }, [spaceId]);
  return list;
}

export function addReview(r: Omit<Review, "id" | "createdAt">) {
  const full: Review = {
    ...r,
    id: "REV-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    createdAt: Date.now(),
  };
  const list = readReviews();
  list.unshift(full);
  writeReviews(list);
  return full;
}

// --- SPACES OVERRIDES (INVENTORY) ---
type OverridesMap = Record<string, SpaceOverride>;

function readOverrides(): OverridesMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY_SPACES) || "{}");
  } catch {
    return {};
  }
}

function writeOverrides(o: OverridesMap) {
  localStorage.setItem(KEY_SPACES, JSON.stringify(o));
  window.dispatchEvent(new Event("focusplace:spaces"));
}

export function useSpaceData(spaceId: string): Space | undefined {
  const [space, setSpace] = useState<Space | undefined>(() => getMergedSpace(spaceId));

  useEffect(() => {
    const fetch = () => setSpace(getMergedSpace(spaceId));
    fetch();
    window.addEventListener("focusplace:spaces", fetch);
    window.addEventListener("storage", fetch);
    return () => {
      window.removeEventListener("focusplace:spaces", fetch);
      window.removeEventListener("storage", fetch);
    };
  }, [spaceId]);

  return space;
}

export function getMergedSpace(spaceId: string): Space | undefined {
  const base = SPACES.find((s) => s.id === spaceId);
  if (!base) return undefined;
  const overrides = readOverrides()[spaceId];
  if (!overrides) return base;
  return {
    ...base,
    capacity: overrides.capacity ?? base.capacity,
    occupied: overrides.occupied ?? base.occupied,
    lowDemandHours: overrides.lowDemandHours ?? base.lowDemandHours,
  };
}

export function updateSpaceInventory(spaceId: string, patch: SpaceOverride) {
  const current = readOverrides();
  current[spaceId] = { ...current[spaceId], ...patch };
  writeOverrides(current);
}

// --- USER TIER ---
export function useUserTier(): "free" | "premium" {
  const [tier, setTier] = useState<"free" | "premium">("free");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const val = localStorage.getItem(KEY_TIER) as "free" | "premium" | null;
    if (val) setTier(val);
    const h = () => {
      const updated = localStorage.getItem(KEY_TIER) as "free" | "premium" | null;
      setTier(updated || "free");
    };
    window.addEventListener("focusplace:user", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("focusplace:user", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return tier;
}

export function setUserTier(t: "free" | "premium") {
  localStorage.setItem(KEY_TIER, t);
  window.dispatchEvent(new Event("focusplace:user"));
}

