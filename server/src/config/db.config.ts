import "reflect-metadata";
import "dotenv/config";
import path from "path";
import { DataSource } from "typeorm";
import entities from "./entities";

const { POSTGRES_URL, NODE_ENV } = process.env;
const migrations = [path.join(__dirname, "../migrations/*.{ts,js}")];

let pg: DataSource;

if (POSTGRES_URL) {
  pg = new DataSource({
    type: "postgres",
    url: POSTGRES_URL,
    synchronize: NODE_ENV !== "production",
    entities,
    migrations,
    migrationsTableName: "migration_table",
  });
} else {
  console.warn("POSTGRES_URL not provided. Falling back to SQLite.");
  // Migrations are written for Postgres, so SQLite always synchronizes:
  // it's a disposable local DB, resetting it is fine.
  pg = new DataSource({
    type: "sqlite",
    database: "sqlite.db",
    synchronize: true,
    entities,
    migrationsTableName: "migration_table",
  });
}

export default pg;
