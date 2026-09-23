import { useState } from "react";
import type { ParameterCommandType } from "../components/autocomplete/command_parameter_popup.tsx";

export interface UsePopupStateReturn {
  activePopup: ParameterCommandType | null;
  openPopup: (type: ParameterCommandType) => void;
  closePopup: () => void;
  handleParameterSubmit: (paramValue: string, onExecuteCommand: (fullCommand: string) => void) => void;
}

export function usePopupState(onOpen?: () => void): UsePopupStateReturn {
  const [activePopup, setActivePopup] = useState<ParameterCommandType | null>(null);

  const openPopup = (type: ParameterCommandType) => {
    setActivePopup(type);
    onOpen?.();
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  const handleParameterSubmit = (
    paramValue: string,
    onExecuteCommand: (fullCommand: string) => void
  ) => {
    if (!activePopup) return;
    const cmdName = activePopup;
    setActivePopup(null);

    const fullCommand = `/${cmdName} ${paramValue}`;
    onExecuteCommand(fullCommand);
  };

  return {
    activePopup,
    openPopup,
    closePopup,
    handleParameterSubmit,
  };
}
