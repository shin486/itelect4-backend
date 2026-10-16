// Vercel serverless entrypoint.
// Exports the Express app as the default request handler so Vercel can serve
// it as a serverless function. Local development continues to use src/server.ts.
import app from "./app.js";

export default app;
