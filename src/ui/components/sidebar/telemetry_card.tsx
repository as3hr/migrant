import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export interface TelemetryCardProps {
  tokensUsed?: number | undefined;
  maxTokens?: number | undefined;
  costUsd?: number | undefined;
}

export function TelemetryCard({
  tokensUsed = 0,
  maxTokens = 64000,
  costUsd = 0.0,
}: TelemetryCardProps): JSX.Element {
  const percentUsed = Math.min(
    100,
    Math.round((tokensUsed / maxTokens) * 100)
  );

  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={0}
      marginBottom={1}
    >
      <Text color={theme.accent} bold>
        Context & Telemetry
      </Text>

      <Box flexDirection="column" marginTop={1} gap={0}>
        <Box justifyContent="space-between">
          <Text color={theme.textSecondary}>Tokens Used:</Text>
          <Text color={theme.textPrimary}>
            {tokensUsed.toLocaleString()} / {(maxTokens / 1000).toFixed(0)}k
          </Text>
        </Box>

        <Box justifyContent="space-between">
          <Text color={theme.textSecondary}>Window Used:</Text>
          <Text color={percentUsed > 80 ? theme.warning : theme.success}>
            {percentUsed}%
          </Text>
        </Box>

        <Box justifyContent="space-between">
          <Text color={theme.textSecondary}>Session Cost:</Text>
          <Text color={theme.badgeCost}>${costUsd.toFixed(4)}</Text>
        </Box>
      </Box>
    </Box>
  );
}
