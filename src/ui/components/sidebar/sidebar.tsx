import { Box } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";
import { DatabaseCard } from "./database_card.tsx";
import { ShortcutsCard } from "./shortcuts_card.tsx";
import { TelemetryCard } from "./telemetry_card.tsx";

export interface SidebarProps {
  databases?: string[] | undefined;
  tokensUsed?: number | undefined;
  maxTokens?: number | undefined;
  costUsd?: number | undefined;
  width?: number | undefined;
}

export function Sidebar({
  databases,
  tokensUsed,
  maxTokens,
  costUsd,
  width = 34,
}: SidebarProps): JSX.Element {
  return (
    <Box flexDirection="column" width={width} paddingLeft={1} backgroundColor={theme.bgCanvas}>
      <DatabaseCard databases={databases} />
      <TelemetryCard
        tokensUsed={tokensUsed}
        maxTokens={maxTokens}
        costUsd={costUsd}
      />
      <ShortcutsCard />
    </Box>
  );
}
