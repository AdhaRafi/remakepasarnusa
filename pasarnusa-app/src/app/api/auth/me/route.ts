import { getSession } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  return apiSuccess({ user: session || null });
}
