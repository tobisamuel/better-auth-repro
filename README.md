# Better Auth Schema Generation Issue

This repository demonstrates an issue with Better Auth's schema generation when using external model references in the drizzle adapter schema configuration.

## Issue Description

When adding a `references` configuration to a field in Better Auth's organization plugin schema that points to an external model (defined in the drizzle adapter's `schema` config but not in Better Auth's internal schema), the `auth:generate` command fails with:

```
[BetterAuthError: Model "category" not found in schema]
```

The issue occurs because Better Auth's schema generation process (`getAuthTables`) only includes:

- Core Better Auth tables (user, session, account, verification)
- Plugin-defined tables (from `plugin.schema`)

It does **not** include external tables defined in the drizzle adapter's `schema` configuration, which are only used at runtime.

## Reproduction Steps

1. Install dependencies:

```sh
bun install
```

2. Run the schema generation command:

```sh
bun auth:generate
```

3. You should see the error:

```
[BetterAuthError: Model "category" not found in schema]
```

## The Problematic Configuration

In `src/lib/auth.ts`, the organization plugin has a field with a reference to the external `category` model:

```typescript
organization({
  schema: {
    organization: {
      additionalFields: {
        primaryCategoryId: {
          type: "string",
          required: true,
          references: {
            field: "id",
            model: "category", // ← This model is not in Better Auth's internal schema
            onDelete: "restrict",
          },
        },
      },
    },
  },
});
```

The `category` table is defined in `src/db/schema.ts` and passed to the drizzle adapter:

```typescript
database: drizzleAdapter(db, {
  provider: "pg",
  schema: schema,  // ← category is in this schema
}),
```

## Workaround

Commenting out the `references` configuration allows the generation to succeed:

```typescript
primaryCategoryId: {
  type: "string",
  required: true,
  // references: {
  //   field: "id",
  //   model: "category",
  //   onDelete: "restrict",
  // },
},
```

However, this means the foreign key relationship is not validated during schema generation.

## Expected Behavior

Better Auth's schema generation should either:

1. Include external drizzle schema tables in the generation process, OR
2. Skip validation of external references during generation (since they're validated at runtime by the drizzle adapter)

## Environment

- Better Auth: ^1.4.1
- Drizzle ORM: ^0.44.7
- Node.js: v24.11.0
- Bun: latest

## Running the API

To run the API (auth routes will work):

```sh
bun run dev
```

The API will be available at `http://localhost:3000/api/auth/*`
