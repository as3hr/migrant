/** @jsxImportSource @opentui/react */
import type { JSX } from "react";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import { DatabaseCard } from "./database_card.tsx";
import { ShortcutsCard } from "./shortcuts_card.tsx";
import { TelemetryCard } from "./telemetry_card.tsx";

export interface SidebarProps {
  databases?: string[] | undefined;
  session?: IChatSessionsModel | undefined;
  activeModel?: string | undefined;
  width?: number | undefined;
}

export function Sidebar({
  databases,
  session,
  activeModel,
  width = 34,
}: SidebarProps) {
  return (
    <box
      style={{
        flexDirection: "column",
        width,
        paddingLeft: 1,
        backgroundColor: theme.bgCanvas,
      }}
    >
      <DatabaseCard databases={databases} sessionName={session?.title} />
      <TelemetryCard
        activeModel={activeModel}
        tokensUsed={session?.session_token_used || 0}
        maxTokens={session?.session_token_limit || 0}
      />
      <ShortcutsCard />
    </box>
  );
}
