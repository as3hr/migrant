import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export function ShortcutsCard(): JSX.Element {
  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={1}
      borderColor={theme.borderPrimary}
    >
      <Text color={theme.purple} bold>
        ⌨ Commands & Keys
      </Text>

      <Box flexDirection="column" marginTop={1}>
        <Box justifyContent="space-between">
          <Text color={theme.brandLight} bold>/connect</Text>
          <Text color={theme.textDim}>Connect DB Pool</Text>
        </Box>
        <Box justifyContent="space-between">
          <Text color={theme.brandLight} bold>/sessions</Text>
          <Text color={theme.textDim}>Switch Session</Text>
        </Box>
        <Box justifyContent="space-between">
          <Text color={theme.brandLight} bold>/login</Text>
          <Text color={theme.textDim}>Sign In Account</Text>
        </Box>
        <Box justifyContent="space-between">
          <Text color={theme.brandLight} bold>/logout</Text>
          <Text color={theme.textDim}>Sign Out</Text>
        </Box>
        <Box justifyContent="space-between">
          <Text color={theme.brandLight} bold>/help</Text>
          <Text color={theme.textDim}>All Commands</Text>
        </Box>
        <Box justifyContent="space-between" marginTop={1}>
          <Text color={theme.textSecondary}>Ctrl + C</Text>
          <Text color={theme.textDim}>Quit CLI</Text>
        </Box>
      </Box>
    </Box>
  );
}
