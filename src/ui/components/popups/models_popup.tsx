/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
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

export function ModelsPopup({ onSubmit, onClose }: ModelsPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pendingModel, setPendingModel] = useState<FlatModelItem | null>(null);

  useKeyboard(
    (key) => {
      if (pendingModel) return;

      if (key.name === "escape") {
        onClose();
        return;
      }

      if (key.name === "up") {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : Math.max(0, FLAT_MODELS.length - 1)
        );
      } else if (key.name === "down") {
        setSelectedIndex((prev) =>
          prev < FLAT_MODELS.length - 1 ? prev + 1 : 0
        );
      } else if (key.name === "enter") {
        const selected = FLAT_MODELS[selectedIndex];
        if (selected) {
          credentialStore.get(selected.apiKeyEnv).then((apiKey: string | null) => {
            if (apiKey) {
              onSubmit(`${selected.providerId}:${selected.model.id}`);
            } else {
              setPendingModel(selected);
            }
          });
        }
      }
    }
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
    <box style={{ flexDirection: "column" }}>
      <box style={{ marginBottom: 1 }}>
        <text style={{ fg: theme.brandLight }}>
          <strong>🤖 Select AI Provider & Model</strong>
        </text>
      </box>
      <box style={{ flexDirection: "column" }}>
        {FLAT_MODELS.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <box style={{ flexDirection: "column" }} key={`${item.providerId}-${item.model.id}`}>
              {item.isFirstInGroup && (
                <box style={{ marginTop: index === 0 ? 0 : 1 }}>
                  <text style={{ fg: theme.accent }}>
                    <strong>{`── ${item.providerName} ──`}</strong>
                  </text>
                </box>
              )}
              <box style={{ justifyContent: "space-between", width: "100%", paddingLeft: 1, paddingRight: 1 }}>
                <box>
                  <text style={{ fg: isSelected ? theme.brandLight : theme.textSecondary }}>
                    {isSelected ? <strong>{`► ${item.model.name}`}</strong> : `  ${item.model.name}`}
                  </text>
                  <text style={{ fg: theme.textDim }}> ({item.model.id})</text>
                </box>
                <text style={{ fg: isSelected ? theme.textPrimary : theme.textDim }}>
                  {Math.round(item.model.contextWindow / 1000)}k ctx
                </text>
              </box>
            </box>
          );
        })}
      </box>
      <box style={{ marginTop: 1 }}>
        <text style={{ fg: theme.textDim }}>
          Use ↑/↓ to navigate · [Enter] to select model · [Esc] to cancel
        </text>
      </box>
    </box>
  );
}
