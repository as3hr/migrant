import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export function HeroLogo(): JSX.Element {
  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Text color={theme.brand} bold>
        {`
   __  ___ ________  ___  ___  _  ______
  /  |/  //  _/ ___// _ \\/ _ \\/ |/ /_  __/
 / /|_/ /_/ // (_ / /_/ / __ /    / / /   
/_/  /_//___/\\___/\\____/_/ |_/_/|_/ /_/    
        `}
      </Text>
      <Box marginTop={1}>
        <Text color={theme.textSecondary}>
          PostgreSQL Schema Intelligence & Agent System
        </Text>
      </Box>
    </Box>
  );
}
