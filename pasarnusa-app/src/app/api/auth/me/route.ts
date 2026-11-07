import { getSession } from "@/backend/lib/auth";
import { apiSuccess } from "@/backend/lib/api-response";

export async function GET() {
  const session = await getSession();
  return apiSuccess({ user: session || null });
}
