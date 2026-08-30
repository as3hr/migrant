import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export function ShortcutsCard(): JSX.Element {
  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={0}
    >
      <Text color={theme.purple} bold>
        Shortcuts & Commands
      </Text>

      <Box flexDirection="column" marginTop={1} gap={0}>
        <Box justifyContent="space-between">
          <Text color={theme.textPrimary}>/connect</Text>
          <Text color={theme.textDim}>Connect DB</Text>
        </Box>
        <Box justifyContent="space-between">
          <Text color={theme.textPrimary}>/sessions</Text>
          <Text color={theme.textDim}>Past Sessions</Text>
        </Box>
        <Box justifyContent="space-between">
          <Text color={theme.textPrimary}>/represent</Text>
          <Text color={theme.textDim}>Web Diagram</Text>
        </Box>
        <Box justifyContent="space-between">
          <Text color={theme.textPrimary}>Ctrl + P</Text>
          <Text color={theme.textDim}>Palette</Text>
        </Box>
        <Box justifyContent="space-between">
          <Text color={theme.textPrimary}>Ctrl + L</Text>
          <Text color={theme.textDim}>Clear Screen</Text>
        </Box>
      </Box>
    </Box>
  );
}
