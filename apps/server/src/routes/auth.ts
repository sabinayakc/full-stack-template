import { Hono } from "hono";
import { auth } from "@/auth/server";

const app = new Hono();

app.all("/*", async (c) => {
  return auth.handler(c.req.raw);
});

export default app;
