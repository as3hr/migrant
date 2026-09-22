import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";

export type ParameterCommandType = "connect" | "represent" | "sessions";

export interface CommandParameterPopupProps {
  command: ParameterCommandType;
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
  databases?: string[] | undefined;
  sessions?: IChatSessionsModel[] | undefined;
}

export function CommandParameterPopup({
  command,
  onSubmit,
  onClose,
  databases = [],
  sessions = [],
}: CommandParameterPopupProps): JSX.Element {
  const [textValue, setTextValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeDbs = databases ?? [];
  const activeSessions = sessions ?? [];

  const listItems =
    command === "represent"
      ? activeDbs
      : command === "sessions"
      ? activeSessions
      : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [command]);

  useInput((_, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (command === "represent" || command === "sessions") {
      if (key.upArrow) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : Math.max(0, listItems.length - 1)
        );
      } else if (key.downArrow) {
        setSelectedIndex((prev) =>
          prev < listItems.length - 1 ? prev + 1 : 0
        );
      } else if (key.return) {
        if (command === "represent" && activeDbs.length > 0) {
          const selectedDb = activeDbs[selectedIndex];
          if (selectedDb) onSubmit(selectedDb);
        } else if (command === "sessions" && activeSessions.length > 0) {
          const selectedSession = activeSessions[selectedIndex];
          if (selectedSession) onSubmit(selectedSession.id);
        }
      }
    }
  });

  const handleTextSubmit = (val: string) => {
    const trimmed = val.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.borderFocused}
      backgroundColor={theme.bgCanvas}
      paddingX={1}
      paddingY={1}
      marginBottom={1}
      width="100%"
    >
      {command === "connect" && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.brandLight} bold>
              🔌 Connect PostgreSQL Database
            </Text>
          </Box>
          <Text color={theme.textSecondary}>
            Enter connection URL (e.g. postgres://user:pass@localhost:5432/dbname):
          </Text>
          <Box
            marginTop={1}
            borderStyle="single"
            borderColor={theme.borderPrimary}
            paddingX={1}
          >
            <Text color={theme.brand} bold>
              {"❯ "}
            </Text>
            <TextInput
              value={textValue}
              onChange={setTextValue}
              onSubmit={handleTextSubmit}
              placeholder="postgres://username:password@host:5432/database"
              focus
            />
          </Box>
          <Box marginTop={1}>
            <Text color={theme.textDim}>
              Press [Enter] to connect · [Esc] to cancel
            </Text>
          </Box>
        </Box>
      )}

      {command === "represent" && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.brandLight} bold>
              📊 Represent Database Schema
            </Text>
          </Box>
          {activeDbs.length === 0 ? (
            <Box flexDirection="column">
              <Text color={theme.warning}>No active databases connected.</Text>
              <Text color={theme.textSecondary}>
                Run /connect first to add a database pool.
              </Text>
            </Box>
          ) : (
            <Box flexDirection="column">
              <Box marginBottom={1}>
                <Text color={theme.textSecondary}>
                  Select a connected database pool to view ER diagram:
                </Text>
              </Box>
              {activeDbs.map((db, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <Box key={db} paddingX={1}>
                    <Text
                      color={isSelected ? theme.brandLight : theme.textSecondary}
                      bold={isSelected}
                    >
                      {isSelected ? "► " : "  "}
                      {db}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          )}
          <Box marginTop={1}>
            <Text color={theme.textDim}>
              Use ↑/↓ to navigate · [Enter] to select · [Esc] to cancel
            </Text>
          </Box>
        </Box>
      )}

      {command === "sessions" && (
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
      )}
    </Box>
  );
}
