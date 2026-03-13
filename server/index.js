import { createApp } from "./http/app.js";

const app = createApp();
const port = Number.parseInt(process.env.PORT, 10) || 3001;

app.listen(port, () => {
  console.log(`Local admin API running at http://localhost:${port}`);
});
