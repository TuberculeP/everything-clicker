import postgres from "pg";

const pg = new postgres.Pool({
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

function pgConnect() {
  const { POSTGRES_URL } = process.env;

  if (!POSTGRES_URL) {
    throw new Error("Please provide all the required environment variables");
  }

  pg.options.connectionString = POSTGRES_URL;

  pg.connect((err) => {
    if (err) {
      console.error("Connection error", err.stack);
    } else {
      console.log("> Connected to the database");
    }
  });
}

export { pg, pgConnect };
