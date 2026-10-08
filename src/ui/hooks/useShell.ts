import { useEffect, useState } from "react";
import { appContext, type AskOptions } from "../../domain/index.ts";
import type { IChatSessionsModel } from "../../infrastructure/index.ts";
import { emitEvent } from "../../utils/index.ts";
import type { OutputItem } from "../components/output.tsx";
import type { ParameterCommandType } from "../components/popups/index.ts";
import { useAuth, type UseAuthReturn } from "./useAuth.ts";
import { useChatOutputs } from "./useChatOutputs.ts";
import { useCommandExecutor, type RunState } from "./useCommandExecutor.ts";
import { useHotkeys } from "./useHotkeys.ts";
import { usePopupState } from "./usePopupState.ts";
import { useScrollState } from "./useScrollState.ts";
import { useStdoutDimensions } from "./useStdoutDimensions.ts";
import { useWorkspaceStatus } from "./useWorkspaceStatus.ts";

export type ViewMode = "hero" | "chat";

export interface UseShellReturn {
  outputs: OutputItem[];
  input: string;
  setInput: (value: string) => void;
  run: RunState;
  dimensions: { width: number; height: number };
  user: string | undefined;
  databases: string[] | undefined;
  sessions: IChatSessionsModel[];
  currentSession: IChatSessionsModel | undefined;
  activeModel: string | undefined;
  activePopup: ParameterCommandType | null;
  openPopup: (type: ParameterCommandType) => void;
  closePopup: () => void;
  handleParameterSubmit: (paramValue: string) => void;
  spinnerVisible: boolean;
  formInputProps: AskOptions;
  handleSubmit: (rawValue: string) => void;
  auth: UseAuthReturn;

  // View Mode & Scroll controls
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  selectedIndex: number;
  scrollUp: () => void;
  scrollDown: () => void;
  atBottom: boolean;
}

export function useShell(onExit: () => void): UseShellReturn {
  const dimensions = useStdoutDimensions();
  const auth = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>("hero");

  const workspaceStatus = useWorkspaceStatus(auth);
  const popupState = usePopupState();

  const chatOutputs = useChatOutputs((loadedCount) => {
    if (loadedCount > 0) {
      setViewMode("chat");
    }
  });

  useEffect(() => {
    const handleUpdateSession = async (data?: { updatedSession?: IChatSessionsModel; isSwitch?: boolean }) => {
      if (!data?.updatedSession || data.updatedSession == null) {
        setViewMode('hero');
        chatOutputs.clearOutputs();
      }
    };
    emitEvent.on("update-session", handleUpdateSession);
    return () => {
      emitEvent.off("update-session", handleUpdateSession);
    };
  }, []);

  const commandExecutor = useCommandExecutor({
    onExit,
    appendOutput: chatOutputs.appendOutput,
    replaceLastWithItem: chatOutputs.replaceLastWithItem,
    clearOutputs: chatOutputs.clearOutputs,
    openPopup: popupState.openPopup,
    startAssistantStream: chatOutputs.startAssistantStream,
    updateAssistantStream: chatOutputs.updateAssistantStream,
    refreshStatus: workspaceStatus.refreshStatus,
    onCommandSubmitted: (commandName?: string) => {
      const stayInHeroCommands = ["connect", "disconnect", "rename-db", "rename", "new", "login", "logout", "models"];
      if ((commandName && stayInHeroCommands.includes(commandName)) || !appContext.providerSdk) {
        return;
      }

      setViewMode("chat");
    },
  });

  const scrollState = useScrollState(chatOutputs.outputs.length);

  useHotkeys({
    onExit,
    onClear: () => { },
    isStreaming: commandExecutor.run.kind === "running",
    onScrollUp: scrollState.scrollUp,
    onScrollDown: scrollState.scrollDown,
  });

  const openPopup = (type: ParameterCommandType) => {
    commandExecutor.setInput("");
    popupState.openPopup(type);
  };

  const handleParameterSubmit = (paramValue: string) => {
    commandExecutor.setInput("");
    popupState.handleParameterSubmit(paramValue, (fullCommand) => {
      if (fullCommand.startsWith("/sessions")) {
        setViewMode("chat");
      }
      void commandExecutor.executeInput(fullCommand);
    });
  };

  return {
    outputs: chatOutputs.outputs,
    input: commandExecutor.input,
    setInput: commandExecutor.setInput,
    run: commandExecutor.run,
    dimensions,
    user: workspaceStatus.user,
    databases: workspaceStatus.databases,
    sessions: workspaceStatus.sessions,
    currentSession: workspaceStatus.currentSession,
    activeModel: workspaceStatus.activeModel,
    activePopup: popupState.activePopup,
    openPopup,
    closePopup: popupState.closePopup,
    handleParameterSubmit,
    spinnerVisible: commandExecutor.spinnerVisible,
    formInputProps: commandExecutor.formInputProps,
    handleSubmit: commandExecutor.handleSubmit,
    auth,
    viewMode,
    setViewMode,
    selectedIndex: scrollState.selectedIndex,
    scrollUp: scrollState.scrollUp,
    scrollDown: scrollState.scrollDown,
    atBottom: scrollState.atBottom,
  };
}
