import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { theme } from "../theme.ts";
import { AutocompletePopup, SLASH_COMMANDS } from "./autocomplete/autocomplete_popup.tsx";
import type { ParameterCommandType } from "./autocomplete/command_parameter_popup.tsx";

interface PromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onTriggerPopup?: (command: ParameterCommandType) => void;

  user?: string;
  databases?: string[];
  label?: string;

  placeholder?: string;
  mask?: string;
}

const PARAM_COMMANDS: ParameterCommandType[] = ["connect", "represent", "sessions"];

export function Prompt(props: PromptProps): JSX.Element {
  const placeholder = props.placeholder ?? "Ask anything about your schema...";
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDismissed(false);
  }, [props.value]);

  const handleSelect = (completedText: string) => {
    const cmdName = completedText.trim().replace("/", "") as ParameterCommandType;
    if (PARAM_COMMANDS.includes(cmdName) && props.onTriggerPopup) {
      props.onTriggerPopup(cmdName);
    } else {
      props.onChange(completedText);
    }
  };

  const handleSubmit = (rawValue: string) => {
    const trimmed = rawValue.trim();
    const isPartialSlash = trimmed.startsWith("/") && !trimmed.includes(" ");
    const isExactFullCommand = SLASH_COMMANDS.some(
      (cmd) => `/${cmd.name}` === trimmed
    );

    if (isPartialSlash && !isExactFullCommand && highlightedText) {
      const cmdName = highlightedText.trim().replace("/", "") as ParameterCommandType;
      if (PARAM_COMMANDS.includes(cmdName) && props.onTriggerPopup) {
        props.onTriggerPopup(cmdName);
        return;
      }
      props.onChange(highlightedText);
      return;
    }

    props.onSubmit(rawValue);
  };

  return (
    <Box flexDirection="column" width="100%" marginBottom={1}>
      {!isDismissed && (
        <AutocompletePopup
          input={props.value}
          onSelect={handleSelect}
          onHighlight={setHighlightedText}
          onClose={() => setIsDismissed(true)}
        />
      )}
      <Box
        width="100%"
        backgroundColor={theme.borderPrimary}
        paddingX={1}
        paddingY={1}
      >
        <Text color={"white"} bold>{"❯ "}</Text>
        <TextInput
          value={props.value}
          focus
          onChange={props.onChange}
          onSubmit={handleSubmit}
          placeholder={placeholder}
          {...(props.mask !== undefined ? { mask: props.mask } : {})}
        />
      </Box>
    </Box>
  );
}