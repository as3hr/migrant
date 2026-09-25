import { Box, Text, useInput } from "ink";
import type { JSX } from "react";
import { useState } from "react";
import { appContext } from "../../../domain/app_context.ts";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";

export interface SessionsPopupProps {
  sessions?: IChatSessionsModel[] | undefined;
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
}

export function SessionsPopup({
  sessions = [],
  onSubmit,
  onClose,
}: SessionsPopupProps): JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeSessions = sessions ?? [];

  useInput((_, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, activeSessions.length - 1)
      );
    } else if (key.downArrow) {
      setSelectedIndex((prev) =>
        prev < activeSessions.length - 1 ? prev + 1 : 0
      );
    } else if (key.return) {
      if (activeSessions.length > 0) {
        const selectedSession = activeSessions[selectedIndex];
        appContext.commandCtx?.log(
          `CommandParameterPopup: selected session: ${selectedSession?.id}`
        );
        if (selectedSession) onSubmit(selectedSession.id);
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.brandLight} bold>
          📜 Select Chat Session
        </Text>
      </Box>
      {activeSessions.length === 0 ? (
        <Box flexDirection="column">
          <Text color={theme.textSecondary}>No past sessions recorded.</Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.textSecondary}>
              Select a session to switch history:
            </Text>
          </Box>
          {activeSessions.map((sess, index) => {
            const isSelected = index === selectedIndex;
            return (
              <Box
                key={sess.id}
                justifyContent="space-between"
                width="100%"
                paddingX={1}
              >
                <Box>
                  <Text
                    color={isSelected ? theme.brandLight : theme.textSecondary}
                    bold={isSelected}
                  >
                    {isSelected ? "► " : "  "}
                    {sess.title || "Untitled Session"}
                  </Text>
                </Box>
                <Text color={isSelected ? theme.textPrimary : theme.textDim}>
                  {sess.session_token_used} tokens
                </Text>
              </Box>
            );
          })}
        </Box>
      )}
      <Box marginTop={1}>
        <Text color={theme.textDim}>
          Use ↑/↓ to navigate · [Enter] to switch · [Esc] to cancel
        </Text>
      </Box>
    </Box>
  );
}
