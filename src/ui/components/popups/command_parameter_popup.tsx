/** @jsxImportSource @opentui/react */
import type { JSX } from "react";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import { ConnectPopup } from "./connect_popup.tsx";
import { ModelsPopup } from "./models_popup.tsx";
import { SessionsPopup } from "./sessions_popup.tsx";
import { InfoPopup } from "./info_popup.tsx";
import { DisconnectPopup } from "./disconnect_popup.tsx";
import { RenameDbPopup } from "./rename_db_popup.tsx";
import { RenameSessionPopup } from "./rename_session_popup.tsx";

export type ParameterCommandType = "connect" | "sessions" | "models" | "info" | "disconnect" | "rename-db" | "rename";

export interface CommandParameterPopupProps {
  command: ParameterCommandType;
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
  databases?: string[] | undefined;
  sessions?: IChatSessionsModel[] | undefined;
  session?: IChatSessionsModel | undefined;
  activeModel?: string | undefined;
}

export function CommandParameterPopup({
  command,
  onSubmit,
  onClose,
  databases,
  sessions = [],
  session,
  activeModel,
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
      {command === "info" && (
        <InfoPopup databases={databases} session={session} activeModel={activeModel} onClose={onClose} />
      )}
      {command === "disconnect" && (
        <DisconnectPopup databases={databases} onSubmit={onSubmit} onClose={onClose} />
      )}
      {command === "rename-db" && (
        <RenameDbPopup databases={databases} onSubmit={onSubmit} onClose={onClose} />
      )}
      {command === "rename" && (
        <RenameSessionPopup onSubmit={onSubmit} onClose={onClose} />
      )}
    </box>
  );
}
