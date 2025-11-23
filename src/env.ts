import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const apiEnv = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    BASE_URL: z.url(),
    APP_URL: z.url(),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
