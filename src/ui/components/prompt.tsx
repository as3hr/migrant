import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type { JSX } from "react";

interface PromptProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  mask?: string;
}

export function Prompt(props: PromptProps): JSX.Element {
  const { label, value, onChange, onSubmit } = props;

  const inputProps: {
    value: string;
    focus: boolean;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    placeholder?: string;
    mask?: string;
  } = {
    value,
    focus: true,
    onChange,
    onSubmit,
  };

  if (props.placeholder !== undefined) {
    inputProps.placeholder = props.placeholder;
  }

  if (props.mask !== undefined) {
    inputProps.mask = props.mask;
  }

  return (
    <Box>
      <Text color="cyan">{label}</Text>
      <Text> </Text>
      <TextInput {...inputProps} />
    </Box>
  );
}