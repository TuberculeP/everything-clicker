// Generates a migration by diffing the entities against a temporary database
// that only has the existing migrations applied, so a local database that was
// synchronized in dev can't hide the changes.
// Usage: npm run migration:generate -- <Name>
import "dotenv/config";
import { spawnSync } from "node:child_process";
import pg from "pg";

// docker-compose.local.yml defaults
const DEFAULT_URL = "postgres://user:password@localhost:5432/mydatabase";

const name = process.argv[2];
if (!name || !/^[A-Za-z0-9_]+$/.test(name)) {
  console.error(
    "Usage: npm run migration:generate -- <Name> (letters, digits, _)",
  );
  process.exit(1);
}

const baseUrl = process.env.POSTGRES_URL || DEFAULT_URL;
const tempDb = `migration_gen_${Date.now()}`;
const tempUrl = new URL(baseUrl);
tempUrl.pathname = `/${tempDb}`;

const typeorm = (args) =>
  spawnSync(
    `npx typeorm-ts-node-commonjs ${args} -d server/src/config/db.config.ts`,
    {
      stdio: "inherit",
      // npx is npx.cmd on Windows
      shell: true,
      env: {
        ...process.env,
        TS_NODE_PROJECT: "server/tsconfig.json",
        POSTGRES_URL: tempUrl.toString(),
        // Turns synchronize off, see db.config.ts
        NODE_ENV: "production",
      },
    },
  ).status;

const admin = new pg.Client({ connectionString: baseUrl });
await admin.connect();
await admin.query(`CREATE DATABASE "${tempDb}"`);

let status = 1;
try {
  status = typeorm("migration:run");
  if (status === 0) {
    status = typeorm(
      `migration:generate --pretty server/src/migrations/${name}`,
    );
  }
  if (status === 0) {
    spawnSync("npx eslint --fix server/src/migrations", {
      stdio: "inherit",
      shell: true,
    });
  }
} finally {
  await admin.query(`DROP DATABASE "${tempDb}" WITH (FORCE)`);
  await admin.end();
}
process.exit(status ?? 1);
