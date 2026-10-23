import { Router, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import { aiRequestSchema } from "../schemas/review.js";
import { reviewProject, AiReplyError, ApiError } from "../ai/gemini.js";

const aiRouter = Router();

aiRouter.use(requireAuth);

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.userId!,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "AI review rate limit exceeded. Try again in a minute.",
  },
});

aiRouter.post(
  "/review",
  aiLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parse = aiRequestSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({
        success: false,
        message: "Validation error.",
        errors: parse.error.issues.map((i) => i.message),
      });
      return;
    }

    const { prompt } = parse.data;

    try {
      const review = await reviewProject(prompt);
      res.status(200).json({ success: true, data: review });
      return;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          res.status(429).json({
            success: false,
            message:
              "Gemini API quota exhausted. Please try again later or check your API key quota.",
          });
          return;
        }
        res.status(error.status || 502).json({
          success: false,
          message: error.message || "Gemini API error.",
        });
        return;
      }

      if (error instanceof AiReplyError) {
        res.status(502).json({
          success: false,
          message: "AI review could not be completed.",
          detail: error.message,
        });
        return;
      }

      next(error);
    }
  }
,
);

export default aiRouter;
