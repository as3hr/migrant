import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type { JSX } from "react";

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
  const username = props.user?.split("@")[0];

  const promptLabel =
    props.label ??
    [
      username ? `$${username}` : null,
      props.databases?.length
        ? `[${props.databases.join(", ")}]`
        : null,
      ">",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <Box>
      <Text color="cyan">{promptLabel}</Text>
      <Text> </Text>

      <TextInput
        value={props.value}
        focus
        onChange={props.onChange}
        onSubmit={props.onSubmit}
        {...(props.placeholder !== undefined
          ? { placeholder: props.placeholder }
          : {})}
        {...(props.mask !== undefined
          ? { mask: props.mask }
          : {})}
      />
    </Box>
  );
}