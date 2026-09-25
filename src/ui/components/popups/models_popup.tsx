import { Box, Text, useInput } from "ink";
import type { JSX } from "react";
import { useState } from "react";
import {
  credentialStore,
  PROVIDER_MODELS,
  PROVIDERS,
  type ModelConfig,
  type ProviderId,
} from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import { ApiKeyPopup } from "./api_key_popup.tsx";

export interface ModelsPopupProps {
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
}

interface FlatModelItem {
  providerId: ProviderId;
  providerName: string;
  apiKeyEnv: string;
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
        apiKeyEnv: provider.apiKeyEnv,
        model: m,
        isFirstInGroup: idx === 0,
      });
    });
  }
  return result;
})();

export function ModelsPopup({ onSubmit, onClose }: ModelsPopupProps): JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pendingModel, setPendingModel] = useState<FlatModelItem | null>(null);

  useInput(
    async (_, key) => {
      if (pendingModel) return;

      if (key.escape) {
        onClose();
        return;
      }

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
          const apiKey: string | null = await credentialStore.get(selected.apiKeyEnv);
          if (apiKey) {
            onSubmit(`${selected.providerId}:${selected.model.id}`);
          } else {
            setPendingModel(selected);
          }
        }
      }
    },
    { isActive: !pendingModel }
  );

  if (pendingModel) {
    return (
      <ApiKeyPopup
        providerName={pendingModel.providerName}
        apiKeyEnv={pendingModel.apiKeyEnv}
        onSubmit={(keyInput) => {
          onSubmit(`${pendingModel.providerId}:${pendingModel.model.id} ${keyInput}`);
        }}
        onClose={onClose}
      />
    );
  }

  return (
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
  );
}
