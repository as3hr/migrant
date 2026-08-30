#!/usr/bin/env bun
import { appContext, type CommandContext } from "./domain/index.ts";
import { answerQuestion } from "./ui/commands/answer_question.ts";
import { errorMessage, parseCommandInput, runCommand } from "./ui/commands/command_helpers.ts";

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        await import("./ui/index.tsx");
        return;
    }

    const rawInput = args.join(" ").trim();
    const oneShotCtx: CommandContext = {
        log: (text) => process.stdout.write(`${text}\n`),
        replaceLast: (text) => process.stdout.write(`\r\x1b[K${text}`),
        success: (text) => process.stdout.write(`\x1b[32m✓\x1b[0m ${text}\n`),
        error: (text) => process.stderr.write(`\x1b[31m✗\x1b[0m ${text}\n`),
        busy: (_label) => { },
        clear: () => console.clear(),
        exit: () => process.exit(0),
        ask: async (_label) => {
            throw new Error("Interactive prompt requested in non-interactive CLI mode. Please pass arguments inline.");
        },
    };

    appContext.createCommandContext(oneShotCtx);

    try {
        let promptText = rawInput;
        if (promptText.toLowerCase().startsWith("ask ")) {
            promptText = promptText.slice(4).trim();
        } else if (promptText.toLowerCase().startsWith("query ")) {
            promptText = promptText.slice(6).trim();
        }

        const parsed = parseCommandInput(promptText.startsWith("/") ? promptText : `/${promptText}`);

        if (parsed) {
            const command = appContext.commandRegistry.get(parsed.name);
            if (command) {
                await runCommand(command, parsed.args, oneShotCtx);
                process.exit(0);
            }
        }

        await answerQuestion(promptText, oneShotCtx);
        process.exit(0);
    } catch (err) {
        oneShotCtx.error(errorMessage(err));
        process.exit(1);
    }
}

void main();
