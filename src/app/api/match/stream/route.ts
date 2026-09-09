import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedOrigin } from "@/lib/origin";
import {
  getBalancedCollegeListStaged,
  MatchValidationError,
} from "@/lib/services/college-list-builder.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function event(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST(request: Request): Promise<Response> {
  // 1. Authentication — always required for a live, per-user match stream.
  const session = await auth();
  if (!session?.user?.id) {
    return jsonResponse(401, { error: "Authentication required." });
  }

  // 2. Cross-site request defense — only same-origin POSTs are accepted.
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return jsonResponse(403, { error: "Forbidden." });
  }

  // 3. Rate limiting — keyed by caller IP, generous bucket for a Match run.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(`stream:${session.user.id}:${ip}`)) {
    return jsonResponse(429, { error: "Too many match requests. Please try again shortly." });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => {
        try {
          controller.enqueue(encoder.encode(event(payload)));
        } catch {
          // Client disconnected — stop streaming.
        }
      };

      try {
        const view = await getBalancedCollegeListStaged({}, (stage) => {
          send({ type: "stage", stage });
        });
        send({ type: "result", view });
      } catch (err) {
        send({ type: "error", message: err instanceof MatchValidationError ? err.message : undefined });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed or client disconnected.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}