import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db.js";

const PORT = Number(process.env.PORT ?? 4000);
const MONGO_URL = process.env.MONGO_URL as string;
const SELF_URL = process.env.SELF_URL || `http://localhost:${PORT}`;

async function main() {
  if (!MONGO_URL) throw new Error("Missing MONGO_URL in .env");
  await connectDB(MONGO_URL);
  app.listen(PORT, () => console.log(`🚀 Server at ${SELF_URL}`));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
