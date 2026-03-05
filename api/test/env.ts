import fs from "fs";
import dotenv from "dotenv";

if (fs.existsSync(".env.test")) {
  dotenv.config({ path: ".env.test" });
}
process.env.NODE_ENV = "test";
