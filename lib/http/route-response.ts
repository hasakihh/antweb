export function jsonError(message: string, status = 500) {
  return Response.json({ error: message }, { status });
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
