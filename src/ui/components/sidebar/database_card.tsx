import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export interface SessionOverviewCardProps {
  databases?: string[] | undefined;
  sessionName: string;
}

export function DatabaseCard({ databases = [], sessionName }: SessionOverviewCardProps): JSX.Element {
  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={1}
      marginBottom={1}
      borderColor={theme.borderPrimary}
    >
      {/* Session Title Section */}
      <Box flexDirection="column" marginBottom={1}>
        <Text color={theme.accent} bold>
          💬 Active Session
        </Text>
        <Text color={theme.brandLight} bold wrap="truncate">
          {sessionName}
        </Text>
      </Box>

      {/* Connected Databases Section */}
      <Box flexDirection="column">
        <Text color={theme.brand} bold>
          🗄  Connected Databases
        </Text>

        {databases.length === 0 ? (
          <Box marginTop={1}>
            <Text color={theme.textDim}>No active PostgreSQL pool</Text>
          </Box>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            {databases.map((dbName) => (
              <Box key={dbName}>
                <Text color={theme.success}>●  </Text>
                <Text color={theme.textPrimary} bold>{dbName}</Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
