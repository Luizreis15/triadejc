import * as Sentry from "@sentry/react";

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (typeof dsn !== "string" || dsn.length === 0) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}

export function captureException(error: unknown): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.captureException(error);
}
