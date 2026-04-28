import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { getProviderKey, type Provider } from "@/lib/ai/credentials";
import {
  SYSTEM_PROMPT,
  REWRITE_SYSTEM_PROMPT,
  DETECT_AND_SCORE_TOOL,
  REWRITE_TOOL,
  buildUserMessage,
  buildRewriteMessage,
  type AnalysisInput,
  type RewriteInput,
} from "@/lib/ai/prompts";
import {
  detectAndScoreSchema,
  rewriteAndScoreSchema,
  type DetectAndScore,
  type RewriteAndScore,
} from "@/lib/ai/schemas";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export class MissingApiKeyError extends Error {
  constructor(public provider: Provider) {
    super(
      provider === "anthropic"
        ? "Chưa có Anthropic API key. Vào Cài đặt để thêm key."
        : "Chưa có OpenAI API key. Vào Cài đặt để thêm key.",
    );
    this.name = "MissingApiKeyError";
  }
}

export class AiResponseError extends Error {
  constructor(message: string, public detail?: unknown) {
    super(message);
    this.name = "AiResponseError";
  }
}

function logSchemaFailure(
  provider: string,
  kind: "detect_and_score" | "rewrite_and_score",
  raw: unknown,
  issues: unknown,
) {
  console.error(
    `[ai] ${provider} ${kind} schema validation failed`,
    JSON.stringify({ issues, raw }, null, 2).slice(0, 4000),
  );
}

async function callAnthropic(
  apiKey: string,
  input: AnalysisInput,
): Promise<DetectAndScore> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 6000,
    system: SYSTEM_PROMPT,
    tools: [DETECT_AND_SCORE_TOOL],
    tool_choice: { type: "tool", name: DETECT_AND_SCORE_TOOL.name },
    messages: [{ role: "user", content: buildUserMessage(input) }],
  });

  if (response.stop_reason === "max_tokens") {
    console.error(
      "[ai] anthropic detect_and_score truncated at max_tokens; bump or shorten input",
    );
  }

  const toolBlock = response.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    console.error(
      "[ai] anthropic detect_and_score missing tool_use block",
      JSON.stringify(response, null, 2).slice(0, 2000),
    );
    throw new AiResponseError("AI không trả về tool call hợp lệ", response);
  }

  const parsed = detectAndScoreSchema.safeParse(toolBlock.input);
  if (!parsed.success) {
    logSchemaFailure(
      "anthropic",
      "detect_and_score",
      toolBlock.input,
      parsed.error.issues,
    );
    throw new AiResponseError(
      "AI trả về JSON không khớp schema",
      parsed.error.issues,
    );
  }
  return parsed.data;
}

async function callOpenAI(
  apiKey: string,
  input: AnalysisInput,
): Promise<DetectAndScore> {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: 6000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(input) },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: DETECT_AND_SCORE_TOOL.name,
          description: DETECT_AND_SCORE_TOOL.description,
          parameters: DETECT_AND_SCORE_TOOL.input_schema,
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: DETECT_AND_SCORE_TOOL.name },
    },
  });

  const call = response.choices[0]?.message?.tool_calls?.[0];
  if (!call || call.type !== "function") {
    console.error(
      "[ai] openai detect_and_score missing function tool_call",
      JSON.stringify(response, null, 2).slice(0, 2000),
    );
    throw new AiResponseError("OpenAI không trả về tool call hợp lệ", response);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(call.function.arguments);
  } catch (e) {
    console.error(
      "[ai] openai tool arguments not parseable JSON",
      call.function.arguments.slice(0, 2000),
    );
    throw new AiResponseError("OpenAI tool arguments không phải JSON", e);
  }

  const parsed = detectAndScoreSchema.safeParse(payload);
  if (!parsed.success) {
    logSchemaFailure(
      "openai",
      "detect_and_score",
      payload,
      parsed.error.issues,
    );
    throw new AiResponseError(
      "OpenAI trả về JSON không khớp schema",
      parsed.error.issues,
    );
  }
  return parsed.data;
}

export async function detectAndScore(
  provider: Provider,
  input: AnalysisInput,
): Promise<DetectAndScore> {
  const key = await getProviderKey(provider);
  if (!key) throw new MissingApiKeyError(provider);

  if (provider === "anthropic") return callAnthropic(key, input);
  return callOpenAI(key, input);
}

async function callAnthropicRewrite(
  apiKey: string,
  input: RewriteInput,
): Promise<RewriteAndScore> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 6500,
    system: REWRITE_SYSTEM_PROMPT,
    tools: [REWRITE_TOOL],
    tool_choice: { type: "tool", name: REWRITE_TOOL.name },
    messages: [{ role: "user", content: buildRewriteMessage(input) }],
  });

  if (response.stop_reason === "max_tokens") {
    console.error(
      "[ai] anthropic rewrite truncated at max_tokens; bump or shorten input",
    );
  }

  const toolBlock = response.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    console.error(
      "[ai] anthropic rewrite missing tool_use block",
      JSON.stringify(response, null, 2).slice(0, 2000),
    );
    throw new AiResponseError("AI không trả về tool call hợp lệ", response);
  }

  const parsed = rewriteAndScoreSchema.safeParse(toolBlock.input);
  if (!parsed.success) {
    logSchemaFailure(
      "anthropic",
      "rewrite_and_score",
      toolBlock.input,
      parsed.error.issues,
    );
    throw new AiResponseError(
      "AI trả về JSON không khớp schema",
      parsed.error.issues,
    );
  }
  return parsed.data;
}

async function callOpenAIRewrite(
  apiKey: string,
  input: RewriteInput,
): Promise<RewriteAndScore> {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: 6500,
    messages: [
      { role: "system", content: REWRITE_SYSTEM_PROMPT },
      { role: "user", content: buildRewriteMessage(input) },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: REWRITE_TOOL.name,
          description: REWRITE_TOOL.description,
          parameters: REWRITE_TOOL.input_schema,
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: REWRITE_TOOL.name },
    },
  });

  const call = response.choices[0]?.message?.tool_calls?.[0];
  if (!call || call.type !== "function") {
    console.error(
      "[ai] openai rewrite missing function tool_call",
      JSON.stringify(response, null, 2).slice(0, 2000),
    );
    throw new AiResponseError("OpenAI không trả về tool call hợp lệ", response);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(call.function.arguments);
  } catch (e) {
    console.error(
      "[ai] openai rewrite tool arguments not parseable JSON",
      call.function.arguments.slice(0, 2000),
    );
    throw new AiResponseError("OpenAI tool arguments không phải JSON", e);
  }

  const parsed = rewriteAndScoreSchema.safeParse(payload);
  if (!parsed.success) {
    logSchemaFailure(
      "openai",
      "rewrite_and_score",
      payload,
      parsed.error.issues,
    );
    throw new AiResponseError(
      "OpenAI trả về JSON không khớp schema",
      parsed.error.issues,
    );
  }
  return parsed.data;
}

export async function rewriteAndScore(
  provider: Provider,
  input: RewriteInput,
): Promise<RewriteAndScore> {
  const key = await getProviderKey(provider);
  if (!key) throw new MissingApiKeyError(provider);

  if (provider === "anthropic") return callAnthropicRewrite(key, input);
  return callOpenAIRewrite(key, input);
}
