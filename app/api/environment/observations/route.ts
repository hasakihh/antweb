import { getEnvironmentSnapshot } from "@/lib/environment/environment-repository";
import { jsonError } from "@/lib/http/route-response";
import { isEnvironmentSnapshot } from "@/lib/environment/environment-contract";

export async function GET() {
  try {
    const snapshot = await getEnvironmentSnapshot();
    if (!isEnvironmentSnapshot(snapshot)) {
      return jsonError("环境数据格式无效", 502);
    }
    return Response.json({ snapshot });
  } catch {
    return jsonError("环境数据同步失败");
  }
}
