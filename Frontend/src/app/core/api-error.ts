import { HttpErrorResponse } from '@angular/common/http';

/** Macht aus Backend-Fehlern (Message, ValidationProblemDetails, ...) einen lesbaren Text. */
export function errorMessage(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return 'Unbekannter Fehler.';
  }

  if (err.status === 0) {
    return 'Backend nicht erreichbar. Läuft die API auf http://localhost:5106?';
  }

  const body = err.error;
  if (body?.message) {
    return body.message;
  }
  if (body?.errors) {
    return Object.values(body.errors as Record<string, string[]>)
      .flat()
      .join(' ');
  }
  if (body?.title) {
    return body.title;
  }
  if (err.status === 404) {
    return 'Eintrag wurde nicht gefunden.';
  }
  return `Fehler ${err.status}: ${err.statusText}`;
}
