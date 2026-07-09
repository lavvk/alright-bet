import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Optional "Clean up with AI" helper for market creation.
 *
 * Key-gated: if ANTHROPIC_API_KEY is not set, GET reports { available: false }
 * and POST returns 501. The UI hides the helper when unavailable, so this can
 * never block manual market creation.
 */

const SYSTEM = `You turn a messy, casual description of a friendly bet into a crisp, resolvable yes/no prediction market question.

Rules:
- The question must be answerable YES or NO by a specific resolve-by date.
- Keep it short, neutral, and concrete. No gambling/casino framing.
- optionA is always the "Yes" outcome, optionB the "No" outcome.
- description should state the resolution criteria in one or two sentences.`;

const SCHEMA = {
  type: "object",
  properties: {
    question: { type: "string" },
    optionA: { type: "string" },
    optionB: { type: "string" },
    description: { type: "string" },
  },
  required: ["question", "optionA", "optionB", "description"],
  additionalProperties: false,
} as const;

export async function GET() {
  return NextResponse.json({ available: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI helper is not configured." },
      { status: 501 },
    );
  }

  let input: string;
  try {
    const body = (await request.json()) as { input?: string };
    input = (body.input ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (input.length < 4) {
    return NextResponse.json({ error: "Input too short." }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: input }],
    });

    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      return NextResponse.json({ error: "No output." }, { status: 502 });
    }
    const parsed = JSON.parse(block.text) as Record<string, string>;
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI request failed." },
      { status: 502 },
    );
  }
}
