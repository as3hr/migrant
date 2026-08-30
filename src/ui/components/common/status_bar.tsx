import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export interface StatusBarProps {
  cwd?: string | undefined;
  activeDb?: string | undefined;
  modelName?: string | undefined;
  version?: string | undefined;
  width?: number | undefined;
}

export function StatusBar({
  cwd = process.cwd(),
  activeDb,
  modelName = "deepseek-chat",
  version = "1.0.0",
}: StatusBarProps): JSX.Element {
  const displayCwd =
    cwd.length > 35 ? `...${cwd.slice(cwd.length - 32)}` : cwd;

  return (
    <Box
      justifyContent="space-between"
      backgroundColor={theme.bgCanvas}
    >
      <Box>
        <Text color={theme.textDim}>{displayCwd}</Text>
      </Box>

      <Box>
        {activeDb ? (
          <Text color={theme.success}>
            ● <Text color={theme.textSecondary}>{activeDb}</Text>
          </Text>
        ) : (
          <Text color={theme.warning}>
            ○ <Text color={theme.textDim}>No DB Connected</Text>
          </Text>
        )}
      </Box>

      <Box gap={2}>
        <Text color={theme.accent}>
          [{modelName}]
        </Text>
        <Text color={theme.textDim}>v{version}</Text>
      </Box>
    </Box>
  );
}
