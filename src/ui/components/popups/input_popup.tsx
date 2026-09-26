/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { theme } from "../../theme.ts";

export interface InputPopupProps {
  title: string;
  description?: string;
  placeholder?: string;
  mask?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

export function InputPopup({
  title,
  description,
  placeholder,
  submitLabel = "submit",
  onSubmit,
  onClose,
}: InputPopupProps) {
  const [textValue, setTextValue] = useState("");

  useKeyboard((key) => {
    if (key.name === "escape") {
      onClose();
    }
  });

  const handleTextSubmit = () => {
    const trimmed = textValue.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <box style={{ flexDirection: "column" }}>
      <box style={{ marginBottom: 1 }}>
        <text style={{ fg: theme.brandLight }}>
          <strong>{title}</strong>
        </text>
      </box>

      {description && (
        <text style={{ fg: theme.textSecondary }}>{description}</text>
      )}

      <box
        style={{
          marginTop: 1,
          border: true,
          borderColor: theme.borderPrimary,
          paddingLeft: 1,
          paddingRight: 1,
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <text style={{ fg: theme.brand }}>
          <strong>{"❯ "}</strong>
        </text>
        <input
          style={{ flexGrow: 1 }}
          textColor={theme.textPrimary}
          value={textValue}
          focused
          onInput={setTextValue}
          onSubmit={handleTextSubmit}
          {...(placeholder !== undefined ? { placeholder } : {})}
        />
      </box>

      <box style={{ marginTop: 1 }}>
        <text style={{ fg: theme.textDim }}>
          Press [Enter] to {submitLabel} · [Esc] to cancel
        </text>
      </box>
    </box>
  );
}
