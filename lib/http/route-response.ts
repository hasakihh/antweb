export function jsonError(message: string, status = 500) {
  return Response.json({ error: message }, { status });
}
