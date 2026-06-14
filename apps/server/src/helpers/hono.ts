import { Hono } from "hono";
import { type AuthVariables, requireAuth } from "@/middleware/auth";

export const createApp = (route?: string) => {
  const app = new Hono<{ Variables: AuthVariables }>();
  app.use(requireAuth);
  app.onError((err, c) => {
    const prefix = route ? `[${route}]` : "";
    console.error(`${prefix}[${c.req.method}] ${c.req.path} —`, err);
    return c.json({ error: "Internal Server Error" }, 500);
  });
  return app;
};
