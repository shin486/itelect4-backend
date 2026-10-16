// Vercel serverless function entrypoint.
// Re-exports the Express app (with the cached DB-connection middleware) so
// Vercel can serve it as a serverless function.
import app from "../src/app.js";

export default app;
