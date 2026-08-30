import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export interface UserMessageCardProps {
  prompt: string;
}

export function UserMessageCard({ prompt }: UserMessageCardProps): JSX.Element {
  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={0}
      marginBottom={1}
    >
      <Box justifyContent="space-between" marginBottom={0}>
        <Text color={theme.brandLight} bold>
          ❯ USER PROMPT
        </Text>
      </Box>

      <Box marginTop={0}>
        <Text color={theme.brandLight} bold>
          {"> "}
        </Text>
        <Text color={theme.textPrimary} bold>
          {prompt}
        </Text>
      </Box>
    </Box>
  );
}
