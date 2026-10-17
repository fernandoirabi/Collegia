import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedOrigin } from "@/lib/origin";
import {
  getBalancedCollegeListStaged,
  type MatchPipelineStage,
} from "@/lib/services/college-list-builder.service";
import {
  emitMatchEvents,
  resolveProfileSource,
} from "@/lib/services/guest-match.service";

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
  // 1. Caller identity. Signed-in students are matched from their saved
  //    profile; signed-out visitors may match from their submitted wizard
  //    answers. Authentication is no longer required to get a real list.
  const session = await auth();

  // 2. Cross-site request defense — only same-origin POSTs are accepted.
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return jsonResponse(403, { error: "Forbidden." });
  }

  // 3. Resolve the profile source. The request body is only read — and only
  //    trusted — for guests; a signed-in caller's body is ignored entirely,
  //    so authenticated behavior is unchanged.
  let rawBody: unknown;
  if (!session?.user?.id) {
    try {
      rawBody = await request.json();
    } catch {
      return jsonResponse(400, {
        error: "Your match details were invalid. Please review your answers.",
      });
    }
  }

  const source = resolveProfileSource(session, rawBody);
  if (source.kind === "invalid") {
    return jsonResponse(400, { error: source.error });
  }

  // 4. Rate limiting — keyed per user when signed in, otherwise per IP so
  //    guests cannot exhaust a shared bucket.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateKey = session?.user?.id
    ? `stream:user:${session.user.id}:${ip}`
    : `stream:guest:${ip}`;
  if (!rateLimit(rateKey)) {
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

      const onStage = (stage: MatchPipelineStage) => send({ type: "stage", stage });
      const run = () =>
        source.kind === "guest"
          ? getBalancedCollegeListStaged({}, onStage, source.profile)
          : getBalancedCollegeListStaged({}, onStage);

      await emitMatchEvents(run, send, {
        guest: source.kind === "guest",
        ip,
      });

      try {
        controller.close();
      } catch {
        // Already closed or client disconnected.
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
