import { analysisSchema, type PulseAnalysis } from "./pulse-types";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

const SYSTEM_PROMPT = `You are Pulse, a coordination intelligence analyst.
You read an entire conversation (meeting notes, chat thread, transcript) and classify its
coordination signals into exactly three categories:

GONE DARK (goneDark): unresolved, unanswered, abandoned, blocked or forgotten items with no
clear owner or follow-up. Questions nobody answered, problems nobody took ownership of,
promised follow-ups that never happened, items waiting on a person/team with no progress.
"person" = the person waiting on / affected by it, or who raised it, if identifiable; else null.
"reason" = short explanation of why it is dark.

IN MOTION (inMotion): actionable tasks with a clear owner that are actively moving forward.
"person" = the owner who committed to it. Always identify the owner when the text allows.

CONFIRMED (confirmed): clearly agreed decisions, facts, commitments or conclusions.
Usually no single owner; leave "person" null unless clearly attributable.

Rules:
- Use the context of the WHOLE conversation, not individual lines in isolation.
- Never mix categories. Do not classify ordinary statements or small talk as tasks.
- Keep each "item" a single, concrete, self-contained sentence.
- "confidence" is a number 0-1 reflecting how certain the classification is.
- If a category has nothing, return an empty array for it.
- Do not invent people or facts that are not in the conversation.`;

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["goneDark", "inMotion", "confirmed"],
  properties: {
    goneDark: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["person", "item", "reason", "confidence"],
        properties: {
          person: { type: ["string", "null"] },
          item: { type: "string" },
          reason: { type: ["string", "null"] },
          confidence: { type: ["number", "null"] },
        },
      },
    },
    inMotion: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["person", "item", "context", "confidence"],
        properties: {
          person: { type: ["string", "null"] },
          item: { type: "string" },
          context: { type: ["string", "null"] },
          confidence: { type: ["number", "null"] },
        },
      },
    },
    confirmed: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["person", "item", "context", "confidence"],
        properties: {
          person: { type: ["string", "null"] },
          item: { type: "string" },
          context: { type: ["string", "null"] },
          confidence: { type: ["number", "null"] },
        },
      },
    },
  },
} as const;

export class AnalysisError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

/** Reads the streamed SSE body and returns the accumulated output text. */
async function readStream(res: Response): Promise<string> {
  if (!res.body) throw new AnalysisError("The AI service returned an empty response.", 502);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        } else if (event.type === "response.completed" && !text) {
          text = event.response?.output_text ?? "";
        }
      } catch {
        // ignore keep-alives / non-JSON frames
      }
    }
  }
  return text.trim();
}

function errorMessageForStatus(status: number): string {
  if (status === 402) return "The AI workspace is out of credits. Please add credits and retry.";
  if (status === 403) return "AI access is blocked for this workspace. Please check AI settings.";
  if (status === 429) return "Too many requests right now. Please wait a moment and try again.";
  if (status === 401) return "The AI service is not configured correctly.";
  return "The AI service is temporarily unavailable. Please try again.";
}

export async function analyzeConversation(
  conversation: string,
  signal?: AbortSignal,
): Promise<PulseAnalysis> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AnalysisError("The AI service is not configured correctly.", 500);

  let res: Response;
  try {
    res = await fetch(GATEWAY_URL, {
      method: "POST",
      signal: signal ?? null,
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        instructions: SYSTEM_PROMPT,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Analyze this conversation and return the three categories as JSON.\n\n---\n${conversation}\n---`,
              },
            ],
          },
        ],
        reasoning: { effort: "medium", summary: "auto" },
        text: {
          format: {
            type: "json_schema",
            name: "pulse_analysis",
            strict: true,
            schema: jsonSchema,
          },
        },
      }),
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new AnalysisError("Could not reach the AI service. Please try again.", 502);
  }

  if (!res.ok) {
    throw new AnalysisError(errorMessageForStatus(res.status), res.status >= 500 ? 502 : res.status);
  }

  const text = await readStream(res);
  if (!text) throw new AnalysisError("The AI returned an empty analysis. Please try again.", 502);

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new AnalysisError("The AI returned an unreadable analysis. Please try again.", 502);
  }

  const parsed = analysisSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AnalysisError("The AI returned an unexpected analysis format. Please try again.", 502);
  }
  return parsed.data;
}
