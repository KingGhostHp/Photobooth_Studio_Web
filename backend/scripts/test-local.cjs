// Creates/reuses a dedicated test database. Never truncates the development database.
const { Pool } = require("pg");
const { spawnSync } = require("node:child_process");
(async () => {
  if (!process.env.DATABASE_URL)
    throw Error("Load your local backend environment first.");
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = "/aura_studio_rework_test";
  const admin = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const exists = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname=$1",
      ["aura_studio_rework_test"],
    );
    if (!exists.rowCount)
      await admin.query("CREATE DATABASE aura_studio_rework_test");
  } finally {
    await admin.end();
  }
  const result = spawnSync(
    process.execPath,
    ["--test", "test/domain.test.cjs", "test/integration.test.cjs", "test/webhook-gateway.test.cjs"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        TEST_DATABASE_URL: url.href,
        DATABASE_URL: url.href,
        ADMIN_USERNAME: "test-admin",
        ADMIN_PASSWORD: "test-password-only",
        CHECKOUT_SECRET: "test-checkout-secret",
        PAYMENT_WEBHOOK_SECRET: "test-webhook-secret",
      },
    },
  );
  process.exitCode = result.status ?? 1;
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
