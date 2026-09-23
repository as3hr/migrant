import { useStdout } from "ink";
import { useEffect, useRef, useState } from "react";
import { appContext, type AskOptions, type CommandContext } from "../../domain/index.ts";
import { supabase, type IChatSessionsModel } from "../../infrastructure/index.ts";
import {
  errorMessage,
  parseCommandInput,
  runCommand
} from "../commands/command_helpers.ts";
import { answerQuestion } from "../commands/index.ts";
import type { ParameterCommandType } from "../components/autocomplete/command_parameter_popup.tsx";
import { type OutputItem } from "../components/output.tsx";

import { appEmitter } from "../../utils/emitter.ts";
import { SYS_DEFAULT_MODEL } from "../../utils/index.ts";
import { useAuth, type UseAuthReturn } from "./useAuth.ts";

export type RunState =
  | { kind: "idle" }
  | { kind: "running"; label: string }
  | { kind: "form"; label: string };


export interface UseShellReturn {
  outputs: OutputItem[];
  input: string;
  setInput: (value: string) => void;
  run: RunState;
  dimensions: { width: number; height: number };
  user: string | undefined;
  databases: string[] | undefined;
  activeModel: string;
  sessions: IChatSessionsModel[];
  activePopup: ParameterCommandType | null;
  openPopup: (type: ParameterCommandType) => void;
  closePopup: () => void;
  handleParameterSubmit: (paramValue: string) => void;
  spinnerVisible: boolean;
  formInputProps: AskOptions;
  handleSubmit: (rawValue: string) => void;
  auth: UseAuthReturn;
}

export function useShell(onExit: () => void): UseShellReturn {
  const { stdout } = useStdout();
  const auth = useAuth();
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [input, setInput] = useState("");
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const [formOptions, setFormOptions] = useState<AskOptions | null>(null);
  const [dimensions, setDimensions] = useState({
    width: stdout.columns || 80,
    height: stdout.rows || 24,
  });
  const [user, setUser] = useState<string>();
  const [databases, setDatabases] = useState<string[]>();
  const [sessions, setSessions] = useState<IChatSessionsModel[]>([]);
  const [activePopup, setActivePopup] = useState<ParameterCommandType | null>(null);
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const [activeModel, setActiveModel] = useState<string>(SYS_DEFAULT_MODEL);

  const askResolver = useRef<((value: string) => void) | null>(null);
  const busyLabel = useRef("Working");

  const append = (item: OutputItem) =>
    setOutputs((prev) => [...prev, item]);

  const replaceLast = (text: string) =>
    setOutputs((prev) => {
      if (prev.length === 0) return [{ type: "stream", content: text }];
      const last = prev[prev.length - 1]!;
      if (last.type === "stream") return [...prev.slice(0, -1), { type: "stream", content: text }];
      return [...prev, { type: "stream", content: text }];
    });

  const replaceLastWithItem = (item: OutputItem) =>
    setOutputs((prev) => {
      if (prev.length === 0) return [item];
      const last = prev[prev.length - 1]!;
      if (last.type === "stream") return [...prev.slice(0, -1), item];
      return [...prev, item];
    });

  const startRunning = (label: string) => {
    busyLabel.current = label;
    setRun({ kind: "running", label });
  };

  const refreshStatus = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data?.session?.user.email ?? undefined);
    setDatabases(appContext.workspace.databases.map((db) => db.name));
    const sessionList = await appContext.services.chatSessionService.getSessions();
    setSessions(sessionList);
  };

  const openPopup = (type: ParameterCommandType) => {
    setInput("");
    setActivePopup(type);
    void refreshStatus();
  };

  const closePopup = () => {
    setActivePopup(null);
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
    replaceLastWithItem: (item: OutputItem) => replaceLastWithItem(item),
    output: (item: OutputItem) => append(item),
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
      void refreshStatus();
    }
  };

  const handleParameterSubmit = (paramValue: string) => {
    if (!activePopup) return;
    const cmdName = activePopup;
    setActivePopup(null);
    const fullCommand = `/${cmdName} ${paramValue}`;

    appContext.commandCtx?.log(`handleParameterSubmit: paramValue: ${paramValue}, cmdName: ${cmdName}, activePopup: ${activePopup}, fullCommand: ${fullCommand}`);
    void executeInput(fullCommand);
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
      openPopup("connect");
      return;
    }
    if (lower === "/sessions" || lower === "/sessions ") {
      openPopup("sessions");
      return;
    }

    void executeInput(value);
  };

  useEffect(() => {
    const handler = ({ model }: { model: string }) => {
      setActiveModel(model);
    };

    appEmitter.on('update-model', handler);
    return () => {
      appEmitter.off('update-model', handler);
    };
  }, []);

  useEffect(() => {
    const handleUpdateSession = async (data?: { updatedSession?: IChatSessionsModel; isSwitch?: boolean }) => {
      void refreshStatus();
      if (data?.isSwitch && data.updatedSession) {
        const messages = await appContext.services.chatSessionService.getSessionMessages(data.updatedSession.id);
        const mappedOutputs: OutputItem[] = messages.map((msg) => {
          if (msg.role === "user") {
            return { type: "user", content: msg };
          }
          return { type: "assistant", content: msg };
        });
        setOutputs(mappedOutputs);
      }
    };

    appEmitter.on("update-session", handleUpdateSession);
    return () => {
      appEmitter.off("update-session", handleUpdateSession);
    };
  }, []);

  useEffect(() => {
    if (auth.authStatus === "authenticated") {
      void refreshStatus();
    }

    const handler = () => auth.checkAuth();
    appEmitter.on('logout', handler);
    return () => {
      appEmitter.off('logout', handler);
    };
  }, [auth.authStatus]);

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
    sessions,
    activePopup,
    openPopup,
    closePopup,
    handleParameterSubmit,
    spinnerVisible,
    formInputProps,
    handleSubmit,
    auth,
    activeModel,
  };
}

