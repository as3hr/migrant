import { useEffect, useState } from "react";
import type { AskOptions } from "../../domain/index.ts";
import type { IChatSessionsModel } from "../../infrastructure/index.ts";
import type { ParameterCommandType } from "../components/autocomplete/command_parameter_popup.tsx";
import type { OutputItem } from "../components/output.tsx";
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
  activeModel: string;
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

  const commandExecutor = useCommandExecutor({
    onExit,
    appendOutput: chatOutputs.appendOutput,
    replaceLastStream: chatOutputs.replaceLastStream,
    replaceLastWithItem: chatOutputs.replaceLastWithItem,
    clearOutputs: chatOutputs.clearOutputs,
    openPopup: popupState.openPopup,
    refreshStatus: workspaceStatus.refreshStatus,
    onCommandSubmitted: () => {
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

  useEffect(() => {
    if (chatOutputs.outputs.length > 2) {
      setViewMode("chat");
    }
  }, [chatOutputs.outputs.length]);

  const handleParameterSubmit = (paramValue: string) => {
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
    openPopup: popupState.openPopup,
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
