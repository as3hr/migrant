import { pool, protectedComand, startScan } from "@src/exports.ts";
import type { Command } from "commander";

export function registerScanCommand(program: Command) {
  program
  .command("scan <url>")
  .description("Start and scan your migrant agent!")
    .action((url) => {
      protectedComand(() => {
         if (url) {
            pool.connect(url);
            startScan();
          }
      })
    });
}