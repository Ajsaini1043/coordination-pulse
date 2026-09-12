import { createFileRoute } from "@tanstack/react-router";
import { AnalysisError, analyzeConversation } from "@/lib/pulse-analysis.server";
import { MAX_CONVERSATION_LENGTH } from "@/lib/pulse-types";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function fail(error: string, status: number) {
  return json({ success: false, error }, status);
}

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let conversation: unknown;
        try {
          const body = (await request.json()) as { conversation?: unknown };
          conversation = body?.conversation;
        } catch {
          return fail("Invalid request body. Expected JSON.", 400);
        }

        if (typeof conversation !== "string" || conversation.trim().length === 0) {
          return fail("Please enter a conversation to analyze.", 400);
        }
        if (conversation.trim().length < 20) {
          return fail("That conversation is too short to analyze.", 400);
        }
        if (conversation.length > MAX_CONVERSATION_LENGTH) {
          return fail(
            `That conversation is too long. Please keep it under ${MAX_CONVERSATION_LENGTH} characters.`,
            400,
          );
        }

        try {
          const data = await analyzeConversation(conversation.trim(), request.signal);
          return json({ success: true, data });
        } catch (err) {
          if ((err as Error)?.name === "AbortError") {
            return fail("Analysis was cancelled.", 499);
          }
          if (err instanceof AnalysisError) {
            return fail(err.message, err.status);
          }
          console.error("Pulse analyze failed", err);
          return fail("Analysis failed. Please try again.", 500);
        }
      },
    },
  },
});
