import { Box, Text, useInput } from "ink";
import type { JSX } from "react";
import { useStdoutDimensions } from "../../hooks/index.ts";
import { theme } from "../../theme.ts";
import { HeroLogo } from "../hero/hero_logo.tsx";

export interface LoginScreenProps {
  onLogin: () => void;
  onExit: () => void;
  isLoggingIn: boolean;
  loginError?: string | null;
  width?: number;
}

export function LoginScreen({
  onLogin,
  onExit,
  isLoggingIn,
  loginError,
  width = 80,
}: LoginScreenProps): JSX.Element {
   const dimensions = useStdoutDimensions();
  useInput((input, key) => {
    if (isLoggingIn) return;

    if (key.return) {
      onLogin();
    } else if (key.escape || (key.ctrl && input.toLowerCase() === "c")) {
      onExit();
    }
  });

  return (
    <Box
      height={dimensions.height}
      width={dimensions.width}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      backgroundColor={theme.bgCanvas}
    >
      <HeroLogo />

      <Box marginBottom={1}>
        <Text color={theme.accent}>Let's get started.</Text>
      </Box>
      
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={theme.brandLight}
        paddingX={2}
        paddingY={1}
        width={Math.min(76, width - 4)}
        backgroundColor={theme.bgCanvas}
      >
        <Box justifyContent="center" marginBottom={1}>
          <Text color={theme.brand} bold>
            Welcome to Migrant CLI
          </Text>
        </Box>

        {isLoggingIn ? (
          <Box marginTop={1} justifyContent="center" flexDirection="column" alignItems="center">
            <Text color={theme.purple}>Waiting for browser login...</Text>
          </Box>
        ) : (
          <Box marginTop={1} justifyContent="center">
            <Text color={theme.borderFocused} bold>
              [ Press ENTER to Login via Browser ]
            </Text>
          </Box>
        )}

        {loginError ? (
          <Box marginTop={1} justifyContent="center">
            <Text color={theme.error}>✗ {loginError}</Text>
          </Box>
        ) : null}
      </Box>

      <Box marginTop={1}>
        <Text color={theme.textDim}>
          Press <Text color={theme.textSecondary}>Esc</Text> or <Text color={theme.textSecondary}>Ctrl+C</Text> to exit.
        </Text>
      </Box>
    </Box>
  );
}
