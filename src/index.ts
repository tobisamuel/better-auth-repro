import { app } from "./app";
import { closeDatabase } from "./db/index";
import { apiEnv } from "./env";

const server = Bun.serve({
  fetch: app.fetch,
  port: apiEnv.PORT,
});

console.log(`🚀 Server is running on port ${apiEnv.PORT}`);
console.log(`📍 Environment: ${apiEnv.NODE_ENV}`);
console.log(`🔍 Server bound to: ${server.hostname}:${server.port}`);

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    // Close server
    await server.stop();

    // Close database connections
    await closeDatabase();

    console.log("Server shut down successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});
process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception", error);
  void gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at", { promise, reason });
  void gracefulShutdown("unhandledRejection");
});
