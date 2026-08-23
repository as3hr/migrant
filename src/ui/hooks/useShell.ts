import { answerQuestion, appContext, type AskOptions, type CommandContext } from "@src/exports.ts";
import { supabase } from "@src/infrastructure/clients/supabase.client.ts";
import { useStdout } from "ink";
import { useEffect, useRef, useState } from "react";
import {
  errorMessage,
  parseCommandInput,
  runCommand
} from "../commands/command_helpers.ts";
import { type OutputItem } from "../components/output.tsx";

export type RunState =
  | { kind: "idle" }
  | { kind: "running"; label: string }
  | { kind: "form"; label: string };

function bootstrapOutputs(): OutputItem[] {
  return [
    { type: "text", text: "Your database has a structure. Ask about it." },
    { type: "blank" },
    { type: "text", text: "Type /help to see available commands." },
    { type: "blank" },
  ];
}

export interface UseShellReturn {
  outputs: OutputItem[];
  input: string;
  setInput: (value: string) => void;
  run: RunState;
  dimensions: { width: number; height: number };
  user: string | undefined;
  databases: string[] | undefined;
  spinnerVisible: boolean;
  formInputProps: AskOptions;
  handleSubmit: (rawValue: string) => void;
}

export function useShell(onExit: () => void): UseShellReturn {
  const { stdout } = useStdout();
  const [outputs, setOutputs] = useState<OutputItem[]>(bootstrapOutputs);
  const [input, setInput] = useState("");
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const [formOptions, setFormOptions] = useState<AskOptions | null>(null);
  const [dimensions, setDimensions] = useState({
    width: stdout.columns || 80,
    height: stdout.rows || 24,
  });
  const [user, setUser] = useState<string>();
  const [databases, setDatabases] = useState<string[]>();
  const [spinnerVisible, setSpinnerVisible] = useState(false);

  const askResolver = useRef<((value: string) => void) | null>(null);
  const busyLabel = useRef("Working");

  const append = (item: OutputItem) =>
    setOutputs((prev) => [...prev, item]);

  const replaceLast = (text: string) =>
    setOutputs((prev) => {
      if (prev.length === 0) return [{ type: "text", text }];
      const last = prev[prev.length - 1]!;
      if (last.type === "text") return [...prev.slice(0, -1), { type: "text", text }];
      return [...prev, { type: "text", text }];
    });

  const startRunning = (label: string) => {
    busyLabel.current = label;
    setRun({ kind: "running", label });
  };

  const refreshStatus = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data?.session?.user.email ?? undefined);
    setDatabases(appContext.workspace.databases.map((db) => db.name));
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
          append({ type: "error", text: `Unknown command: /${parsed.name}` });
          append({ type: "text", text: "Type /help to see available commands." });
          return;
        }

        startRunning(command.busyLabel ?? "Working");
        await runCommand(command, parsed.args, ctx);
        if (command.name !== "clear") append({ type: "blank" });
      } else if (value === "clear") {
        ctx.clear();
      } else {
        startRunning("Thinking");
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

    if (run.kind !== "idle") return;

    const value = rawValue.trim();
    setInput("");
    if (!value) return;

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
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: stdout.columns || 80,
        height: stdout.rows || 24,
      });
    };

    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);

  useEffect(() => {
    if (run.kind !== "running") {
      setSpinnerVisible(false);
      return;
    }
    const timer = setTimeout(() => setSpinnerVisible(true), 200);
    return () => clearTimeout(timer);
  }, [run.kind]);

  const formInputProps: AskOptions = formOptions ?? {};

  return {
    outputs,
    input,
    setInput,
    run,
    dimensions,
    user,
    databases,
    spinnerVisible,
    formInputProps,
    handleSubmit,
  };
}
