// import { registerCommands } from "@src/exports.ts";
// import { Command } from "commander";

// const program = new Command();

// program.name("migrant").description("CLI for migrant.").version("0.0.1");

// registerCommands(program);

// const scriptArg =
//   process.argv[2]?.endsWith(".ts") || process.argv[2]?.endsWith(".js")
//     ? process.argv.slice(3)
//     : process.argv.slice(2);

// if (scriptArg.length > 0) {
//   program.parse(scriptArg, { from: "user" });
// } else {
  await import("./ui/index.tsx");
// }
