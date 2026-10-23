import { GoogleGenAI, ApiError } from "@google/genai";
import { MODEL, buildContents } from "./prompt.js";
import { reviewSchema, reviewJsonSchema, type Review } from "../schemas/review.js";

let client: GoogleGenAI | null = null;

export function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Set it in your .env file.",
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export class AiReplyError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AiReplyError";
  }
}

export async function reviewProject(prompt: string): Promise<Review> {
  const ai = getClient();
  const contents = buildContents(prompt);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: reviewJsonSchema,
    },
  });

  const text = response.text;
  if (!text || text.trim().length === 0) {
    throw new AiReplyError("Gemini returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (cause) {
    throw new AiReplyError("Gemini returned invalid JSON.", cause);
  }

  const result = reviewSchema.safeParse(parsed);
  if (!result.success) {
    throw new AiReplyError(
      "Gemini reply failed schema validation: ",
      result.error,
    );
  }

  return result.data;
}

export { ApiError };
