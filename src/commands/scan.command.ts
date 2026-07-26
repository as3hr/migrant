import type { Command } from "commander";
import { pool, startScan } from "@src/exports.ts";

export function registerScanCommand(program: Command) {
  program
    .command("scan")
    .description("Start and scan your migrant agent!")
    .option("--db <url>", "connect to a database")
    .action((options) => {
      if (options.db) {
        pool.connect(options.db);
        startScan();
      }
    });
}
