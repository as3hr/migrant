import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { appContext } from "../../../domain/app_context.ts";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";

import { PROVIDER_MODELS, PROVIDERS, type ModelConfig, type ProviderId } from "../../../infrastructure/provider/providers.ts";

export type ParameterCommandType = "connect" | "sessions" | "models";

interface FlatModelItem {
  providerId: ProviderId;
  providerName: string;
  model: ModelConfig;
  isFirstInGroup: boolean;
}

const FLAT_MODELS: FlatModelItem[] = (() => {
  const result: FlatModelItem[] = [];
  for (const provider of PROVIDERS) {
    const models = PROVIDER_MODELS[provider.id] || [];
    models.forEach((m, idx) => {
      result.push({
        providerId: provider.id,
        providerName: provider.name,
        model: m,
        isFirstInGroup: idx === 0,
      });
    });
  }
  return result;
})();

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
  sessions = [],
}: CommandParameterPopupProps): JSX.Element {
  const [textValue, setTextValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeSessions = sessions ?? [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [command]);

  useInput((_, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (command === "sessions") {
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
          appContext.commandCtx?.log(`CommandParameterPopup: selected session: ${selectedSession?.id}`);
          if (selectedSession) onSubmit(selectedSession.id);
        }
      }
    } else if (command === "models") {
      if (key.upArrow) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : Math.max(0, FLAT_MODELS.length - 1)
        );
      } else if (key.downArrow) {
        setSelectedIndex((prev) =>
          prev < FLAT_MODELS.length - 1 ? prev + 1 : 0
        );
      } else if (key.return) {
        const selected = FLAT_MODELS[selectedIndex];
        if (selected) {
          onSubmit(`${selected.providerId}:${selected.model.id}`);
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

      {command === "models" && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.brandLight} bold>
              🤖 Select AI Provider & Model
            </Text>
          </Box>
          <Box flexDirection="column">
            {FLAT_MODELS.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <Box flexDirection="column" key={`${item.providerId}-${item.model.id}`}>
                  {item.isFirstInGroup && (
                    <Box marginTop={index === 0 ? 0 : 1}>
                      <Text color={theme.accent} bold>
                        {`── ${item.providerName} ──`}
                      </Text>
                    </Box>
                  )}
                  <Box justifyContent="space-between" width="100%" paddingX={1}>
                    <Box>
                      <Text
                        color={isSelected ? theme.brandLight : theme.textSecondary}
                        bold={isSelected}
                      >
                        {isSelected ? "► " : "  "}
                        {item.model.name}
                      </Text>
                      <Text color={theme.textDim}> ({item.model.id})</Text>
                    </Box>
                    <Text color={isSelected ? theme.textPrimary : theme.textDim}>
                      {Math.round(item.model.contextWindow / 1000)}k ctx
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box marginTop={1}>
            <Text color={theme.textDim}>
              Use ↑/↓ to navigate · [Enter] to select model · [Esc] to cancel
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
