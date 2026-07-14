import express, { type Request, type Response } from "express";
import { appConfig } from "./config/index.js";
import { logSampleData } from "./connect_to_db.js";

const app = express();

app.get("/", (req: Request, res: Response) => {
  logSampleData();
  res.send("Hello World");
});

const server = app.listen(appConfig.port, () => {
  console.log(`Server is running on http://localhost:${appConfig.port}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${appConfig.port} is already in use.`
    );
    process.exit(1);
  }
  throw err;
});