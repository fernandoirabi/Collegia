import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/current-user";

/**
 * Server-component guard. If there is no signed-in user, redirect to
 * the supplied path (default /login); otherwise return the user id.
 * Prevents guests from rendering profile-scoped pages.
 */
export async function requireUserIdFromPage(redirectTo = "/login"): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) redirect(redirectTo);
  return userId;
}