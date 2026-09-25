import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import type { JSX } from "react";
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
  mask,
  submitLabel = "submit",
  onSubmit,
  onClose,
}: InputPopupProps): JSX.Element {
  const [textValue, setTextValue] = useState("");

  useInput((_, key) => {
    if (key.escape) {
      onClose();
    }
  });

  const handleTextSubmit = (val: string) => {
    const trimmed = val.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={theme.brandLight} bold>
          {title}
        </Text>
      </Box>

      {description && (
        <Text color={theme.textSecondary}>{description}</Text>
      )}

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
          {...(placeholder ? { placeholder } : {})}
          {...(mask ? { mask } : {})}
          focus
        />
      </Box>

      <Box marginTop={1}>
        <Text color={theme.textDim}>
          Press [Enter] to {submitLabel} · [Esc] to cancel
        </Text>
      </Box>
    </Box>
  );
}
