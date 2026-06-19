import { useEffect, useState } from "react";

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
};

const KEY = "focusplace.reservations.v1";

function read(): Reservation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(r: Reservation[]) {
  localStorage.setItem(KEY, JSON.stringify(r));
  window.dispatchEvent(new Event("focusplace:reservations"));
}

export function useReservations() {
  const [list, setList] = useState<Reservation[]>([]);
  useEffect(() => {
    setList(read());
    const h = () => setList(read());
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
  const list = read();
  list.unshift(full);
  write(list);
  return full;
}

export function updateReservation(id: string, patch: Partial<Reservation>) {
  const list = read().map((x) => (x.id === id ? { ...x, ...patch } : x));
  write(list);
}

export function getReservation(id: string): Reservation | undefined {
  return read().find((x) => x.id === id);
}
