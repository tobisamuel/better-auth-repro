import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";

import type { AppVariables } from "./types";
import authRouter from "./auth";

function createApp() {
  const app = new Hono<{
    Variables: AppVariables;
  }>();

  app.use("*", logger());
  app.use("*", requestId());
  app.use(
    "*",
    secureHeaders({
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use("*", timing());
  app.use(
    "*",
    cors({
      origin: ["http://localhost:3000", "http://localhost:3002"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Request-ID",
      ],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    }),
  );

  return app;
}

export const app = createApp().basePath("/api").route("/auth", authRouter);
