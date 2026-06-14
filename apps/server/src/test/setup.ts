process.env.DATABASE_URL ??= "postgres://postgres:postgres@localhost:5432/app_test";
process.env.CLIENT_URL ??= "http://localhost:8081";
process.env.BETTER_AUTH_URL ??= "http://localhost:4000";
process.env.BETTER_AUTH_SECRET ??= "test-secret";
process.env.ENCRYPTION_KEY ??= "0".repeat(64);
