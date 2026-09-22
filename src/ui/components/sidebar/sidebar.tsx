import { Box } from "ink";
import type { JSX } from "react";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import { DatabaseCard } from "./database_card.tsx";
import { ShortcutsCard } from "./shortcuts_card.tsx";
import { TelemetryCard } from "./telemetry_card.tsx";

export interface SidebarProps {
  databases?: string[] | undefined;
  session?: IChatSessionsModel | undefined;
  width?: number | undefined;
}

export function Sidebar({
  databases,
  session,
  width = 34,
}: SidebarProps): JSX.Element {
  return (
    <Box flexDirection="column" width={width} paddingLeft={1} backgroundColor={theme.bgCanvas}>
      <DatabaseCard databases={databases} sessionName={session?.title || "Untitled Session"} />
      <TelemetryCard
        tokensUsed={session?.session_token_used || 0}
        maxTokens={session?.session_token_limit || 0}
        costUsd={(session?.session_token_used || 0) * 0.0001}
      />
      <ShortcutsCard />
    </Box>
  );
}
