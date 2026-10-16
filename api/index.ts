// Vercel serverless function entrypoint.
// Wraps the Express app (with the cached DB-connection middleware) so
// @vercel/node can invoke it per request.
import app from "../src/app.js";

export default async (req: Request, res: Response) => {
  app(req, res);
};
