import { getEnvironmentSnapshot } from "@/lib/environment/environment-repository";

export async function GET() {
  const snapshot = await getEnvironmentSnapshot();
  return Response.json({ snapshot });
}

