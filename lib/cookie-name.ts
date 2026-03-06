/**
 * Nome do cookie de sessão. Usado pelo middleware (Edge) sem depender de jose.
 * A verificação real do JWT é feita em lib/session nas API routes.
 */
export const COOKIE_NAME = "cardio_session";
