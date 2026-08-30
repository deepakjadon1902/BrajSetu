import "dotenv/config";
import { createApp } from "./src/app.js";
import { connectDb } from "./src/config/db.js";
import { ensurePermanentAdmin } from "./src/utils/permanentAdmin.js";

const port = Number(process.env.PORT || 5000);

await connectDb();
await ensurePermanentAdmin();

const app = createApp();

app.listen(port, () => {
  console.log(`Braj Setu Properties API listening on ${port}`);
});
