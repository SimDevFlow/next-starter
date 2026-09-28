import { getErrorMessage } from "@/lib/format";

export const GIFT_MAX_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Formats a date as a `datetime-local` input value (local time, minute precision). */
export function toDateTimeLocal(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function parseDateTimeLocal(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** The backend expects a naive ISO datetime in its local time, like the dates it returns. */
export function toApiDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

// Backend 400 details (matched on a lowercase substring), in French.
const BAD_REQUEST_MESSAGES: [string, string][] = [
  ["expired_at must be in the future", "La date de fin doit être dans le futur : annulez l'abonnement pour y mettre fin maintenant"],
  ["can't last more than 30 days", `Un abonnement offert ne peut pas dépasser ${GIFT_MAX_DAYS} jours`],
  ["already has another active subscription", "Cet utilisateur a déjà un autre abonnement actif à ce service"],
  ["already has an active subscription", "Cet utilisateur a déjà un abonnement actif à ce service"],
  ["has already ended", "Cet abonnement est déjà terminé"],
  ["out of stock", "Plus de profil disponible pour ce service"],
];

export function errorStatus(error: unknown): unknown {
  return typeof error === "object" && error !== null && "status" in error ? error.status : undefined;
}

/** French message for a backend 400 detail; unknown details are returned as is. */
export function translateSubscriptionError(error: unknown): string {
  const detail = getErrorMessage(error, "Une erreur est survenue");
  const lower = detail.toLowerCase();
  return BAD_REQUEST_MESSAGES.find(([needle]) => lower.includes(needle))?.[1] ?? detail;
}
