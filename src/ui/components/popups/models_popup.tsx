/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useMemo, useState } from "react";
import {
  PROVIDER_MODELS,
  PROVIDERS,
  type ModelConfig,
  type ProviderId
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


export function ModelsPopup({ onSubmit, onClose }: ModelsPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pendingModel, setPendingModel] = useState<FlatModelItem | null>(null);

  const FLAT_MODELS = useMemo(() => {
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
  }, []);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return FLAT_MODELS;
    const lowerQuery = searchQuery.toLowerCase();
    return FLAT_MODELS.filter(
      (m) =>
        m.model.name.toLowerCase().includes(lowerQuery) ||
        m.model.id.toLowerCase().includes(lowerQuery) ||
        m.providerName.toLowerCase().includes(lowerQuery)
    );
  }, [FLAT_MODELS, searchQuery]);

  const VISIBLE_COUNT = 15;
  const startIndex = Math.max(0, Math.min(selectedIndex - Math.floor(VISIBLE_COUNT / 2), filteredModels.length - VISIBLE_COUNT));
  const visibleModels = filteredModels.slice(startIndex, startIndex + VISIBLE_COUNT);

  useKeyboard((key) => {
    if (pendingModel) return;

    if (key.name === "escape") {
      onClose();
      return;
    }

    if (key.name === "up") {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, filteredModels.length - 1)
      );
    } else if (key.name === "down") {
      setSelectedIndex((prev) =>
        prev < filteredModels.length - 1 ? prev + 1 : 0
      );
    } else if (key.name === "return" || key.name === "enter") {
      const selected = filteredModels[selectedIndex];
      if (selected) {
        setPendingModel(selected);
      }
    } else if (key.name === "backspace") {
      setSearchQuery((prev) => prev.slice(0, -1));
      setSelectedIndex(0);
    } else if (key.name && key.name.length === 1 && !key.meta && !key.ctrl) {
      setSearchQuery((prev) => prev + key.name);
      setSelectedIndex(0);
    } else if (key.name === "space") {
      setSearchQuery((prev) => prev + " ");
      setSelectedIndex(0);
    }
  });

  if (pendingModel) {
    return (
      <box style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
        <box
          style={{
            flexDirection: "column",
            width: 80,
            borderStyle: "rounded",
            borderColor: theme.accent,
            paddingLeft: 2,
            paddingRight: 2,
            paddingTop: 1,
            paddingBottom: 1,
            backgroundColor: theme.bgPopup,
          }}
        >
          <ApiKeyPopup
            providerName={pendingModel.providerName}
            apiKeyEnv={pendingModel.apiKeyEnv}
            onSubmit={(keyInput) => {
              onSubmit(JSON.stringify({
                providerId: pendingModel.providerId,
                modelId: pendingModel.model.id,
                apiKey: keyInput
              }));
            }}
            onClose={onClose}
          />
        </box>
      </box>
    );
  }

  return (
    <box style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
      <box
        style={{
          flexDirection: "column",
          width: 80,
          borderStyle: "rounded",
          borderColor: theme.accent,
          paddingLeft: 2,
          paddingRight: 2,
          paddingTop: 1,
          paddingBottom: 1,
          backgroundColor: theme.bgPopup,
        }}
      >
        <box style={{ marginBottom: 1, flexDirection: "row", justifyContent: "space-between" }}>
          <text style={{ fg: theme.brandLight }}>
            <strong>🤖 Select AI Provider & Model</strong>
          </text>
          <text style={{ fg: theme.textSecondary }}>
            {filteredModels.length} models
          </text>
        </box>
        
        <box style={{ marginBottom: 1, flexDirection: "row" }}>
          <text style={{ fg: theme.textDim }}>Search: </text>
          <text style={{ fg: searchQuery ? theme.textPrimary : theme.textDim }}>
            {searchQuery || "Type to filter..."}
          </text>
          <text style={{ fg: theme.brandLight }}>█</text>
        </box>

        <box style={{ flexDirection: "column", height: VISIBLE_COUNT }}>
          {visibleModels.length === 0 ? (
            <text style={{ fg: theme.textSecondary }}>No models match your search.</text>
          ) : (
            visibleModels.map((item, idx) => {
              const actualIndex = startIndex + idx;
              const isSelected = actualIndex === selectedIndex;
              return (
                <box key={`${item.providerId}-${item.model.id}`} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <box style={{ flexDirection: "row" }}>
                    <text style={{ fg: isSelected ? theme.brandLight : theme.textSecondary }}>
                      {isSelected ? `► ${item.providerName} - ${item.model.name}` : `  ${item.providerName} - ${item.model.name}`}
                    </text>
                  </box>
                  <text style={{ fg: isSelected ? theme.textPrimary : theme.textDim }}>
                    {`${Math.round(item.model.contextWindow / 1000)}k ctx`}
                  </text>
                </box>
              );
            })
          )}
        </box>

        <box style={{ marginTop: 1, paddingTop: 1, border: ['top'], borderColor: theme.accent }}>
          <text style={{ fg: theme.textDim }}>
            Use ↑/↓ to navigate · [Enter] to select · [Esc] to cancel
          </text>
        </box>
      </box>
    </box>
  );
}
