import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type { JSX } from "react";
import { theme } from "../theme.ts";
import { AutocompletePopup } from "./autocomplete/autocomplete_popup.tsx";

interface PromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;

  user?: string;
  databases?: string[];
  label?: string;

  placeholder?: string;
  mask?: string;
}

export function Prompt(props: PromptProps): JSX.Element {
  const placeholder = props.placeholder ?? "Ask anything about your schema...";

  return (
    <Box flexDirection="column" width="100%" 
      marginBottom={1}>
      <AutocompletePopup
        input={props.value}
        onSelect={(completedText) => props.onChange(completedText)}
      />
      <Box
        width="100%"
        backgroundColor={theme.borderPrimary}
        paddingX={1}
        paddingY={1}
      >
        <Text color={'white'} bold>{"❯ "}</Text>
        <TextInput
          value={props.value}
          focus
          onChange={props.onChange}
          onSubmit={props.onSubmit}
          placeholder={placeholder}
          {...(props.mask !== undefined ? { mask: props.mask } : {})}
        />
      </Box>

    </Box>
  );
}