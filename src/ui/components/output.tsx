/** @jsxImportSource @opentui/react */
import type { IChatMessageModel } from "../../infrastructure/index.ts";
import { theme } from "../theme.ts";
import { AssistantMessageCard } from "./chat/assistant_message_card.tsx";
import { UserMessageCard } from "./chat/user_message_card.tsx";

export type OutputItem =
  | {
      type: "assistant";
      content?: IChatMessageModel;
      isStreaming?: boolean;
      streamText?: string;
      reasoningStream?: string;    
    }
  | { type: "user"; content: IChatMessageModel }
  | { type: "text"; text: string }
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | { type: "blank" };

export function Output({ item }: { item: OutputItem }) {
  switch (item.type) {
    case "user":
      return <UserMessageCard prompt={item.content.content} />;

    case "assistant":
      return (
        <AssistantMessageCard
          response={item.isStreaming ? (item.streamText ?? '') : (item?.content?.content ?? '')}
          isStreaming={item.isStreaming ?? false}
          thoughtTime={item?.content?.thought_time ?? ''}
          reasoningStream={item.reasoningStream ?? ''}
        />
      );

    case "text":
      return (
        <box style={{ paddingLeft: 1, paddingRight: 1 }}>
          <text style={{ fg: theme.textPrimary }}>{item.text}</text>
        </box>
      );

    case "success":
      return (
        <box style={{ paddingLeft: 1, paddingRight: 1 }}>
          <text style={{ fg: theme.textPrimary }}>{"✓ "+item.text}</text>
        </box>
      );

    case "error":
      return (
        <box style={{ paddingLeft: 1, paddingRight: 1 }}>
          <text style={{ fg: theme.textPrimary }}>{"✗ "+item.text}</text>
        </box>
      );

    case "blank":
      return <text> </text>;
  }
}