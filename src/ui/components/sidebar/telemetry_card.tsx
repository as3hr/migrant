import { Box, Text } from "ink";
import type { JSX } from "react";
import { getModelById } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";

export interface TelemetryCardProps {
  activeModel?: string | undefined;
  tokensUsed?: number | undefined;
  maxTokens?: number | undefined;
}

export function TelemetryCard({
  activeModel,
  tokensUsed,
  maxTokens,
}: TelemetryCardProps): JSX.Element {
  let modelName = activeModel || "Default Model";
  if (activeModel) {
    const cleanId = activeModel.includes(":") ? activeModel.split(":")[1] : activeModel;
    const modelConfig = getModelById(cleanId || activeModel);
    if (modelConfig?.name) {
      modelName = modelConfig.name;
    }
  }

  const percentUsed =
    tokensUsed && maxTokens
      ? Math.min(100, Math.round((tokensUsed / maxTokens) * 100))
      : 0;

  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={1}
      marginBottom={1}
      borderColor={theme.borderPrimary}
    >
      <Text color={theme.accent} bold>
        Context Window & Telemetry
      </Text>

      <Box flexDirection="column" marginTop={1}>
        <Box justifyContent="space-between">
          <Text color={theme.textSecondary}>Active Model:</Text>
          <Text color={theme.brandLight} bold>
            {modelName}
          </Text>
        </Box>

        {tokensUsed !== undefined && maxTokens !== undefined && maxTokens > 0 && (
          <>
            <Box justifyContent="space-between">
              <Text color={theme.textSecondary}>Tokens Used:</Text>
              <Text color={theme.textPrimary} bold>
                {tokensUsed.toLocaleString()} / {Math.round(maxTokens / 1000)}k
              </Text>
            </Box>

            <Box justifyContent="space-between">
              <Text color={theme.textSecondary}>Window Capacity:</Text>
              <Text color={percentUsed > 80 ? theme.warning : theme.brandLight} bold>
                {percentUsed}%
              </Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
