import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export interface DatabaseCardProps {
  databases?: string[] | undefined;
}

export function DatabaseCard({ databases = [] }: DatabaseCardProps): JSX.Element {
  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={0}
      marginBottom={1}
    >
      <Text color={theme.brand} bold>
        Connected Databases
      </Text>

      {databases.length === 0 ? (
        <Box marginTop={1}>
          <Text color={theme.textDim}>No active PostgreSQL pool</Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          {databases.map((dbName) => (
            <Text key={dbName} color={theme.success}>
              ● <Text color={theme.textPrimary}>{dbName}</Text>
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
