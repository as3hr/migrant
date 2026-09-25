/** @jsxImportSource @opentui/react */
import type { JSX } from "react";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import { ConnectPopup } from "./connect_popup.tsx";
import { ModelsPopup } from "./models_popup.tsx";
import { SessionsPopup } from "./sessions_popup.tsx";

export type ParameterCommandType = "connect" | "sessions" | "models";

export interface CommandParameterPopupProps {
  command: ParameterCommandType;
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
  databases?: string[] | undefined;
  sessions?: IChatSessionsModel[] | undefined;
}

export function CommandParameterPopup({
  command,
  onSubmit,
  onClose,
  sessions = [],
}: CommandParameterPopupProps) {
  return (
    <box
      style={{
        flexDirection: "column",
        border: true,
        borderColor: theme.borderFocused,
        backgroundColor: theme.bgCanvas,
        paddingLeft: 1,
        paddingRight: 1,
        paddingTop: 1,
        paddingBottom: 1,
        marginBottom: 1,
        width: "100%",
      }}
    >
      {command === "connect" && (
        <ConnectPopup onSubmit={onSubmit} onClose={onClose} />
      )}
      {command === "sessions" && (
        <SessionsPopup sessions={sessions} onSubmit={onSubmit} onClose={onClose} />
      )}
      {command === "models" && (
        <ModelsPopup onSubmit={onSubmit} onClose={onClose} />
      )}
    </box>
  );
}
