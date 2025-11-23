import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { apiEnv } from "../env";
import * as schema from "./schema";

const client = postgres(apiEnv.DATABASE_URL, {
  ssl: apiEnv.NODE_ENV === "production" ? "require" : undefined,
});

export const db = drizzle({
  client,
  logger: apiEnv.NODE_ENV === "development" ? true : false,
  schema,
});

export async function healthCheck(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await client.end();
  } catch (error) {}
}
