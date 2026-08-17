import "dotenv/config";
import { createApp } from "./src/app.js";
import { connectDb } from "./src/config/db.js";

const port = Number(process.env.PORT || 5000);

await connectDb();

const app = createApp();

app.listen(port, () => {
  console.log(`PropVista API listening on ${port}`);
});
