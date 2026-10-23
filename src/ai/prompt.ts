import type { Content } from "@google/genai";
import type { Review } from "../schemas/review.js";

export const MODEL = "gemini-flash-latest";

export const SYSTEM_PROMPT = `
You are an expert ITELECT4 project reviewer. Your job is to review a student's
project submission and return a structured review as JSON.

RULES:
1. Act as an ITELECT4 project reviewer. Be constructive, specific, and fair.
2. NEVER hallucinate features, technologies, or architecture that are not
   described in the submission. If something is not mentioned, treat it as
   absent rather than guessing it exists.
3. Base every strength and improvement strictly on what the student actually
   built and described.
4. Wrap your entire JSON response in <submission> ... </submission> tags.
5. Output ONLY valid JSON inside the tags — no markdown fences, no extra prose.

REVIEW SCHEMA:
- summary: one sentence restating what was built.
- strengths: array of 1 to 3 short strings.
- improvements: array of 1 to 3 short strings.
- readiness: one of "ready", "almost", "not-yet".

Readiness guide:
- "ready"   -> submission is complete and polished.
- "almost"  -> submission is mostly complete with minor gaps.
- "not-yet" -> submission is incomplete or needs significant work.
`;

export const EXAMPLES: Review[] = [
  {
    summary:
      "A course dashboard with course listings, a submission form, and student login.",
    strengths: [
      "Clean separation of pages and reusable UI components.",
      "Form validation with Zod and React Hook Form.",
    ],
    improvements: [
      "Add error boundaries for failed API calls.",
      "Persist draft submissions locally before saving.",
    ],
    readiness: "almost",
  },
  {
    summary:
      "A basic project tracker with hard-coded data and no authentication.",
    strengths: [
      "Displays a list of projects with basic details.",
    ],
    improvements: [
      "Connect to a real backend/API instead of hard-coded data.",
      "Implement user authentication and protected routes.",
      "Add form validation and input sanitization.",
    ],
    readiness: "not-yet",
  },
];

export function buildContents(userPrompt: string): Content[] {
  const exampleTurns: Content[] = EXAMPLES.flatMap((example) => [
    {
      role: "user",
      parts: [
        {
          text: `Review this submission:\n<submission>${JSON.stringify(
            example.summary
          )}</submission>`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `<submission>${JSON.stringify(example)}</submission>`,
        },
      ],
    },
  ]);

  return [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    ...exampleTurns,
    { role: "user", parts: [{ text: `Review this submission:\n<submission>${userPrompt}</submission>` }] },
  ];
}
