import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type { JSX } from "react";
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

function buildContext(props: PromptProps): string | null {
  if (props.label) return null;
  const username = props.user?.split("@")[0];
  const dbSegment = props.databases?.length
    ? props.databases.join(", ")
    : null;
  if (!username && !dbSegment) return null;
  return [username, dbSegment ? `[${dbSegment}]` : null].filter(Boolean).join("  ");
}

export function Prompt(props: PromptProps): JSX.Element {
  const context = buildContext(props);
  const placeholder = props.placeholder ?? "Ask anything about your schema...";

  return (
    <Box flexDirection="column" alignContent="center">

      {context && (
        <Box marginBottom={1}>
          <Text color="#3a3a3a">{context}</Text>
        </Box>
      )}

      {props.label && (
        <Box marginBottom={1}>
          <Text color="#5a5a5a">{props.label}</Text>
        </Box>
      )}

      <AutocompletePopup
        input={props.value}
        onSelect={(completedText) => props.onChange(completedText)}
      />

      <Box
        borderStyle="round"
        borderColor="#2a2a2a"
        paddingX={2}
        paddingY={0}
      >
        <Text color="#3d7a5c">{"$ "}</Text>
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