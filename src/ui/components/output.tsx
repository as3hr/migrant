import { Box, Text } from "ink";
import type { JSX } from "react";
import type { IChatMessageModel } from "../../infrastructure/index.ts";
import { theme } from "../theme.ts";
import { AssistantMessageCard } from "./chat/assistant_message_card.tsx";
import { UserMessageCard } from "./chat/user_message_card.tsx";

export type OutputItem = { type: "stream"; id?: string; content: string }
  | { type: "assistant"; content: IChatMessageModel }
  | { type: "user"; content: IChatMessageModel }
  | { type: "text"; text: string }
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | { type: "blank" };

export function Output({ item }: { item: OutputItem }): JSX.Element {
  switch (item.type) {
    case "user":
      return <UserMessageCard prompt={item.content.content} />;

    case "assistant":
      return (
        <AssistantMessageCard
          response={item.content.content}
          thoughtTime={item.content.thought_time}
        />
      );

    case "stream":
      return <AssistantMessageCard response={item.content} />;

    case "text":
      return (
        <Box paddingX={1}>
          <Text color={theme.textPrimary}>{item.text}</Text>
        </Box>
      );

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