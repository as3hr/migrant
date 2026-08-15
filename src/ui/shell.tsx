import { answerQuestion, appContext, type AskOptions, type CommandContext } from "@src/exports.ts";
import { supabase } from "@src/infrastructure/clients/supabase.client.ts";
import { Box } from "ink";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import {
  errorMessage,
  parseCommandInput,
  requireAuth,
  runCommand,
} from "./commands/command_helpers.ts";
import { Output, type OutputItem } from "./components/output.tsx";
import { Prompt } from "./components/prompt.tsx";
import { Spinner } from "./components/spinner.tsx";

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
  const [databases, setDatabases] = useState<string[]>();
  const [spinnerVisible, setSpinnerVisible] = useState(false);

  const askResolver = useRef<((value: string) => void) | null>(null);
  const busyLabel = useRef("Working");

  const append = (item: OutputItem) => {
    setOutputs((previous) => [...previous, item]);
  };

  const replaceLast = (text: string) => {
    setOutputs((previous) => {
      if (previous.length === 0) {
        return [{ type: "text", text }];
      }
      const last = previous[previous.length - 1]!;
      if (last.type === "text") {
        return [...previous.slice(0, -1), { type: "text", text }];
      }
      return [...previous, { type: "text", text }];
    });
  };

  const startRunning = (label: string) => {
    busyLabel.current = label;
    setRun({ kind: "running", label });
  };

  const refreshStatus = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data?.session?.user.email ?? undefined);
    const userDatabases = appContext.workspace.databases.map((db) => db.name);
    setDatabases(userDatabases);
  };

  const createCommandContext = (): CommandContext => ({
    ask: (label, options) =>
      new Promise<string>((resolve) => {
        askResolver.current = resolve;
        setFormOptions(options ?? null);
        setRun({ kind: "form", label });
      }),
    log: (text) => append({ type: "text", text }),
    replaceLast,
    success: (text) => append({ type: "success", text }),
    error: (text) => append({ type: "error", text }),
    clear: () => setOutputs([]),
    exit: onExit,
    busy: (label) => startRunning(label),
  });

  const executeInput = async (value: string) => {
    const ctx = createCommandContext();
    appContext.createCommandContext(ctx);
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
        await runCommand(command, parsed.args, ctx);

        if (!(command.name === "clear")) {
          append({ type: "blank" });
        }
      } else if(value === 'clear') {
        ctx.clear();
      } else {
        startRunning("Thinking");
        await requireAuth();
        await answerQuestion(value, ctx);
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
      <Box flexDirection="column">
        {outputs.map((item, index) => (
          <Output key={index} item={item} />
        ))}
      </Box>

      {run.kind === "running" && spinnerVisible ? (
        <Spinner label={run.label} />
      ) : null}

      {run.kind === "idle" ? (
        <Prompt
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          {...(user !== undefined ? { user } : {})}
          {...(databases !== undefined ? { databases } : {})}
        /> ) : run.kind === "form" ? (
        <Prompt
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          label={run.label}
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