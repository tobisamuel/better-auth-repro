import type { AuthSession, AuthUser } from "./lib/auth";

export type AppVariables = {
  requestId: string;
};

export type AuthVariables = {
  session: AuthSession;
  user: AuthUser;
};
