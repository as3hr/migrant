import { appContext, type AskOptions, type CommandContext } from "@src/exports.ts";
import { supabase } from "@src/infrastructure/clients/supabase.client.ts";
import { pool } from "@src/infrastructure/db/pool.ts";
import { Box, Text } from "ink";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { answerQuestion } from "./commands/ask.command.ts";
import {
  errorMessage,
  parseCommandInput,
  requireAuth,
  runCommand,
} from "./commands/command_helpers.ts";
import { Output, type OutputItem } from "./components/output.tsx";
import { Prompt } from "./components/prompt.tsx";
import { Spinner } from "./components/spinner.tsx";
import { Status } from "./components/status.tsx";

type RunState =
  | { kind: "idle" }
  | { kind: "running"; label: string }
  | { kind: "form"; label: string };

interface ShellProps {
  onExit: () => void;
}

function bootstrapOutputs(): OutputItem[] {
  return [
    { type: "text", text: "Welcome to Migrant." },
    { type: "blank" },
    { type: "text", text: "Type /help to see available commands." },
  ];
}

export function Shell({ onExit }: ShellProps): JSX.Element {
  const [outputs, setOutputs] = useState<OutputItem[]>(bootstrapOutputs);
  const [input, setInput] = useState("");
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const [formOptions, setFormOptions] = useState<AskOptions | null>(null);
  const [user, setUser] = useState<string>();
  const [database, setDatabase] = useState<string>();
  const [spinnerVisible, setSpinnerVisible] = useState(false);

  const askResolver = useRef<((value: string) => void) | null>(null);
  const busyLabel = useRef("Working");

  const append = (item: OutputItem) => {
    setOutputs((previous) => [...previous, item]);
  };

  const startRunning = (label: string) => {
    busyLabel.current = label;
    setRun({ kind: "running", label });
  };

  const refreshStatus = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data?.session?.user.email ?? undefined);
    setDatabase(pool.dbId ?? undefined);
  };

  const createCommandContext = (): CommandContext => ({
    ask: (label, options) =>
      new Promise<string>((resolve) => {
        askResolver.current = resolve;
        setFormOptions(options ?? null);
        setRun({ kind: "form", label });
      }),
    log: (text) => append({ type: "text", text }),
    success: (text) => append({ type: "success", text }),
    error: (text) => append({ type: "error", text }),
    clear: () => setOutputs([]),
    exit: onExit,
    busy: (label) => startRunning(label),
  });

  const executeInput = async (value: string) => {
    appContext.createCommandContext(createCommandContext());
    const parsed = parseCommandInput(value);

    try {
      if (parsed) {
        const command = appContext.commandRegistry.get(parsed.name);

        if (!command) {
          append({
            type: "error",
            text: `Unknown command: /${parsed.name}`,
          });
          append({
            type: "text",
            text: "Type /help to see available commands.",
          });
          return;
        }

        startRunning(command.busyLabel ?? "Working");
        await runCommand(command, parsed.args);

        if (!(command.name === "clear")) {
          append({ type: "blank" });
        }
      } else {
        startRunning("Thinking");
        await requireAuth();
        await answerQuestion(value);
        append({ type: "blank" });
      }
    } catch (error) {
      append({ type: "error", text: errorMessage(error) });
      append({ type: "blank" });
    } finally {
      setFormOptions(null);
      setRun({ kind: "idle" });
      refreshStatus();
    }
  };

  const handleSubmit = (rawValue: string) => {
    if (run.kind === "form") {
      const resolve = askResolver.current;
      askResolver.current = null;
      setFormOptions(null);
      setInput("");
      startRunning(busyLabel.current);
      resolve?.(rawValue);
      return;
    }

    if (run.kind !== "idle") {
      return;
    }

    const value = rawValue.trim();
    setInput("");

    if (!value) {
      return;
    }

    append({ type: "command", line: value });
    void executeInput(value);
  };

  useEffect(() => {
    let active = true;

    void (async () => {
      if (await appContext.services.authService.checkLoginGuard() && active) {
        void refreshStatus();
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (run.kind !== "running") {
      setSpinnerVisible(false);
      return;
    }

    const timer = setTimeout(() => setSpinnerVisible(true), 200);
    return () => clearTimeout(timer);
  }, [run.kind]);

  const formInputProps: AskOptions = formOptions ?? {};

  return (
    <Box flexDirection="column">
      <Text color="cyan" bold>
        migrant
      </Text>

      <Box flexDirection="column">
        {outputs.map((item, index) => (
          <Output key={index} item={item} />
        ))}
      </Box>

      {run.kind === "running" && spinnerVisible ? (
        <Spinner label={run.label} />
      ) : null}

      <Status
        {...(user !== undefined ? { user } : {})}
        {...(database !== undefined ? { database } : {})}
      />

      {run.kind === "idle" ? (
        <Prompt
          label=">"
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
        />
      ) : run.kind === "form" ? (
        <Prompt
          label={`${run.label}:`}
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          {...(formInputProps.placeholder !== undefined
            ? { placeholder: formInputProps.placeholder }
            : {})}
          {...(formInputProps.mask !== undefined
            ? { mask: formInputProps.mask }
            : {})}
        />
      ) : null}
    </Box>
  );
}