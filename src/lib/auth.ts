import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, openAPI, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc as orgAdminAc,
  defaultStatements as orgDefaultStatements,
  memberAc as orgMemberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";
import { nanoid } from "nanoid";

import { db } from "../db/index";
import * as schema from "../db/schema";
import { apiEnv } from "../env";

export const ac = createAccessControl(orgDefaultStatements);

const ownerRole = ac.newRole(ownerAc.statements);
const adminRole = ac.newRole(orgAdminAc.statements);
const memberRole = ac.newRole(orgMemberAc.statements);

const auth = betterAuth({
  advanced: {
    database: {
      generateId: () => nanoid(),
    },
  },
  baseURL: apiEnv.BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  emailVerification: { autoSignInAfterVerification: true },
  logger: {
    disabled: apiEnv.NODE_ENV === "test",
    level: apiEnv.LOG_LEVEL,
  },
  plugins: [
    admin(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      otpLength: 5,
      async sendVerificationOTP({ email, otp, type }) {
        console.log("Sending verification OTP to", email, otp, type);
      },
    }),
    openAPI({
      disableDefaultReference: true,
    }),
    organization({
      ac,
      organizationLimit: 1,
      roles: {
        admin: adminRole,
        owner: ownerRole,
        member: memberRole,
      },
      requireEmailVerificationOnInvitation: true,
      schema: {
        organization: {
          modelName: "business",
          fields: {
            name: "displayName",
            logo: "logoUrl",
          },
          additionalFields: {
            primaryCategoryId: {
              type: "string",
              required: true,
              references: {
                field: "id",
                model: "category",
                onDelete: "restrict",
              },
            },
            status: {
              type: "string",
              required: true,
              defaultValue: "draft",
            },
          },
        },
        member: {
          additionalFields: {
            capabilities: { type: "json", required: false },
            isActive: {
              type: "boolean",
              required: true,
              defaultValue: true,
            },
            metadata: { type: "json", required: false },
          },
        },
        team: {
          additionalFields: {
            image: { type: "string", required: false },
          },
        },
      },
      teams: {
        enabled: true,
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${apiEnv.APP_URL}/signup/invite/${data.id}`;
        console.log("Sending invitation email to", data.email, inviteLink);
      },
    }),
  ],
  trustedOrigins: ["http://localhost:3000", "http://localhost:3002"],
  user: {
    additionalFields: {
      dateOfBirth: { type: "string", input: true, required: false },
      phoneNumber: { type: "string", input: true, required: false },
      timezone: {
        type: "string",
        input: true,
        required: true,
        defaultValue: "UTC",
      },
    },
  },
});

export type Auth = typeof auth;
export type AuthSession = typeof auth.$Infer.Session.session;
export type AuthUser = typeof auth.$Infer.Session.user;

export default auth;
