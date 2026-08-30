import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../theme.ts";
import { AssistantMessageCard } from "./chat/assistant_message_card.tsx";
import { UserMessageCard } from "./chat/user_message_card.tsx";

export type OutputItem =
  | { type: "command"; line: string }
  | { type: "text"; text: string }
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | { type: "blank" };

export function Output({ item }: { item: OutputItem }): JSX.Element {
  switch (item.type) {
    case "command":
      return <UserMessageCard prompt={item.line} />;

    case "text":
      return <AssistantMessageCard response={item.text} />;

    case "success":
      return (
        <Box paddingX={1}>
          <Text color={theme.success}>{"✓ "}</Text>
          <Text color={theme.textPrimary}>{item.text}</Text>
        </Box>
      );

    case "error":
      return (
        <Box paddingX={1}>
          <Text color={theme.error}>{"✗ "}</Text>
          <Text color={theme.textPrimary}>{item.text}</Text>
        </Box>
      );

    case "blank":
      return <Text> </Text>;
  }
}