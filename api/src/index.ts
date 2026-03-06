import { makeApp } from "./app";

const app = makeApp();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
