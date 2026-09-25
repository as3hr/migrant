/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
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
}: LoginScreenProps) {
   const dimensions = useStdoutDimensions();
  
  useKeyboard((key) => {
    if (isLoggingIn) return;

    if (key.name === "enter") {
      onLogin();
    } else if (key.name === "escape" || (key.ctrl && key.name === "c")) {
      onExit();
    }
  });

  return (
    <box
      style={{
        height: dimensions.height,
        width: dimensions.width,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
        backgroundColor: theme.bgCanvas,
      }}
    >
      <HeroLogo />

      <box style={{ marginBottom: 1 }}>
        <text style={{ fg: theme.accent }}>Let's get started.</text>
      </box>
      
      <box
        style={{
          flexDirection: "column",
          border: true,
          borderColor: theme.brandLight,
          paddingLeft: 2,
          paddingRight: 2,
          paddingTop: 1,
          paddingBottom: 1,
          width: Math.min(76, width - 4),
          backgroundColor: theme.bgCanvas,
        }}
      >
        <box style={{ justifyContent: "center", marginBottom: 1 }}>
          <text style={{ fg: theme.brand }}>
            <strong>Welcome to Migrant CLI</strong>
          </text>
        </box>

        {isLoggingIn ? (
          <box style={{ marginTop: 1, justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
            <text style={{ fg: theme.purple }}>Waiting for browser login...</text>
          </box>
        ) : (
          <box style={{ marginTop: 1, justifyContent: "center" }}>
            <text style={{ fg: theme.borderFocused }}>
              <strong>[ Press ENTER to Login via Browser ]</strong>
            </text>
          </box>
        )}

        {loginError ? (
          <box style={{ marginTop: 1, justifyContent: "center" }}>
            <text style={{ fg: theme.error }}>✗ {loginError}</text>
          </box>
        ) : null}
      </box>

      <box style={{ marginTop: 1, flexDirection: "row" }}>
        <text style={{ fg: theme.textDim }}>Press </text>
        <text style={{ fg: theme.textSecondary }}>Esc</text>
        <text style={{ fg: theme.textDim }}> or </text>
        <text style={{ fg: theme.textSecondary }}>Ctrl+C</text>
        <text style={{ fg: theme.textDim }}> to exit.</text>
      </box>
    </box>
  );
}
