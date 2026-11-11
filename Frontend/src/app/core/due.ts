import { Video } from './models';

export type DueState = 'overdue' | 'soon' | 'ok' | 'done';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Vergleicht nur Kalendertage: am Fälligkeitstag selbst ist ein Video noch nicht überfällig. */
export function dueState(video: Video): DueState {
  if (video.status === 3) {
    return 'done';
  }
  const daysLeft = Math.round((startOfDay(new Date(video.due)) - startOfDay(new Date())) / DAY_MS);
  if (daysLeft < 0) {
    return 'overdue';
  }
  return daysLeft <= 2 ? 'soon' : 'ok';
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function byDue(a: Video, b: Video): number {
  return new Date(a.due).getTime() - new Date(b.due).getTime();
}

/** ISO-Zeitstempel -> Wert für <input type="date"> (lokales Datum). */
export function toDateInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * <input type="date"> -> ISO-Zeitstempel für die API.
 * Leer = null (Backend-Standard: in 3 Tagen). Unverändertes Datum behält die ursprüngliche Uhrzeit.
 */
export function fromDateInput(value: string, original?: string): string | null {
  if (!value) {
    return null;
  }
  if (original && toDateInput(original) === value) {
    return original;
  }
  // Mittag lokaler Zeit, damit die Umrechnung nach UTC das Datum nicht verschiebt.
  return new Date(`${value}T12:00:00`).toISOString();
}
