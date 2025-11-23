import { Hono } from "hono";

import type { AppVariables } from "./types";
import auth from "./lib/auth";

const authRouter = new Hono<{
  Variables: AppVariables;
}>()
  .get("*", (c) => {
    return auth.handler(c.req.raw);
  })
  .post("*", (c) => {
    return auth.handler(c.req.raw);
  });

export default authRouter;
