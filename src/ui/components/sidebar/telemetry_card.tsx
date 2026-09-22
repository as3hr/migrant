import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export interface TelemetryCardProps {
  tokensUsed?: number | undefined;
  maxTokens?: number | undefined;
}

export function TelemetryCard({
  tokensUsed = 0,
  maxTokens = 64000,
}: TelemetryCardProps): JSX.Element {
  const percentUsed = Math.min(
    100,
    Math.round((tokensUsed / (maxTokens || 1)) * 100)
  );

  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={1}
      marginBottom={1}
      borderColor={theme.borderPrimary}
    >
      <Text color={theme.accent} bold>
        ⚡ Context Window & Telemetry
      </Text>

      <Box flexDirection="column" marginTop={1}>
        <Box justifyContent="space-between">
          <Text color={theme.textSecondary}>Tokens Used:</Text>
          <Text color={theme.textPrimary} bold>
            {tokensUsed.toLocaleString()} / {Math.round((maxTokens || 64000) / 1000)}k
          </Text>
        </Box>

        <Box justifyContent="space-between">
          <Text color={theme.textSecondary}>Window Capacity:</Text>
          <Text color={percentUsed > 80 ? theme.warning : theme.brandLight} bold>
            {percentUsed}%
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
