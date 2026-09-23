import { useEffect, useRef, useState } from "react";
import { appContext, type AskOptions, type CommandContext } from "../../domain/index.ts";
import {
  errorMessage,
  parseCommandInput,
  runCommand
} from "../commands/command_helpers.ts";
import { answerQuestion } from "../commands/index.ts";
import type { ParameterCommandType } from "../components/autocomplete/command_parameter_popup.tsx";
import type { OutputItem } from "../components/output.tsx";

export type RunState =
  | { kind: "idle" }
  | { kind: "running"; label: string }
  | { kind: "form"; label: string };

export interface UseCommandExecutorProps {
  onExit: () => void;
  appendOutput: (item: OutputItem) => void;
  replaceLastStream: (text: string) => void;
  replaceLastWithItem: (item: OutputItem) => void;
  clearOutputs: () => void;
  openPopup: (type: ParameterCommandType) => void;
  refreshStatus: () => Promise<void>;
  onCommandSubmitted?: () => void;
}

export interface UseCommandExecutorReturn {
  input: string;
  setInput: (value: string) => void;
  run: RunState;
  spinnerVisible: boolean;
  formInputProps: AskOptions;
  executeInput: (value: string) => Promise<void>;
  handleSubmit: (rawValue: string) => void;
}

export function useCommandExecutor({
  onExit,
  appendOutput,
  replaceLastStream,
  replaceLastWithItem,
  clearOutputs,
  openPopup,
  refreshStatus,
  onCommandSubmitted,
}: UseCommandExecutorProps): UseCommandExecutorReturn {
  const [input, setInput] = useState("");
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const [formOptions, setFormOptions] = useState<AskOptions | null>(null);
  const [spinnerVisible, setSpinnerVisible] = useState(false);

  const askResolver = useRef<((value: string) => void) | null>(null);
  const busyLabel = useRef("Working");

  const startRunning = (label: string) => {
    busyLabel.current = label;
    setRun({ kind: "running", label });
  };

  const createCommandContext = (): CommandContext => ({
    ask: (label, options) =>
      new Promise<string>((resolve) => {
        askResolver.current = resolve;
        setFormOptions(options ?? null);
        setRun({ kind: "form", label });
      }),
    log: (text) => appendOutput({ type: "text", text }),
    replaceLast: replaceLastStream,
    replaceLastWithItem,
    output: appendOutput,
    success: (text) => appendOutput({ type: "success", text }),
    error: (text) => appendOutput({ type: "error", text }),
    clear: clearOutputs,
    exit: onExit,
    busy: (label) => startRunning(label),
  });

  const executeInput = async (value: string) => {
    onCommandSubmitted?.();
    const ctx = createCommandContext();
    appContext.createCommandContext(ctx);
    const parsed = parseCommandInput(value);

    try {
      if (parsed) {
        const command = appContext.commandRegistry.get(parsed.name);

        if (!command) {
          appendOutput({ type: "error", text: `Unknown command: /${parsed.name}` });
          appendOutput({ type: "text", text: "Type /help to see available commands." });
          return;
        }

        startRunning(command.busyLabel ?? "Working");
        await runCommand(command, parsed.args, ctx);
        if (command.name !== "clear") appendOutput({ type: "blank" });
      } else if (value === "clear") {
        ctx.clear();
      } else {
        startRunning("Thinking");
        await answerQuestion(value, ctx);
        appendOutput({ type: "blank" });
      }
    } catch (error) {
      appendOutput({ type: "error", text: errorMessage(error) });
      appendOutput({ type: "blank" });
    } finally {
      setFormOptions(null);
      setRun({ kind: "idle" });
      void refreshStatus();
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

    const lower = value.toLowerCase();
    if (lower === "/connect" || lower === "/connect ") {
      setInput("");
      openPopup("connect");
      return;
    }
    if (lower === "/sessions" || lower === "/sessions ") {
      setInput("");
      openPopup("sessions");
      return;
    }

    void executeInput(value);
  };

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
    input,
    setInput,
    run,
    spinnerVisible,
    formInputProps,
    executeInput,
    handleSubmit,
  };
}
