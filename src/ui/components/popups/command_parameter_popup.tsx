/** @jsxImportSource @opentui/react */
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import { ConnectPopup } from "./connect_popup.tsx";
import { DisconnectPopup } from "./disconnect_popup.tsx";
import { InfoPopup } from "./info_popup.tsx";
import { ModelsPopup } from "./models_popup.tsx";
import { RenameDbPopup } from "./rename_db_popup.tsx";
import { RenameSessionPopup } from "./rename_session_popup.tsx";
import { SessionsPopup } from "./sessions_popup.tsx";

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
      style={
        command === "models"
          ? { width: "100%", height: "100%" }
          : {
              flexDirection: "column",
              borderStyle: "rounded",
              borderColor: theme.accent,
              backgroundColor: theme.bgPopup,
              paddingLeft: 2,
              paddingRight: 2,
              paddingTop: 1,
              paddingBottom: 1,
              marginBottom: 1,
              width: 80,
            }
      }
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
