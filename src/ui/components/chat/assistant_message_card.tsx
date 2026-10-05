/** @jsxImportSource @opentui/react */
import { theme } from "../../theme.ts";
import { MarkdownRenderer } from "./markdown_renderer.tsx";

export interface AssistantMessageCardProps {
  response: string;
  isStreaming?: boolean;
  thoughtTime?: string;
  reasoningStream?: string;
}

export function AssistantMessageCard({
  response,
  isStreaming,
  thoughtTime,
  reasoningStream,
}: AssistantMessageCardProps) {
  const accentColor = theme.thinkingAccents[0] ?? theme.accent;
  const hasReasoning = reasoningStream && reasoningStream.length > 0;
  const isThinking = isStreaming && hasReasoning && !response;

  return (
    <box style={{ flexDirection: "column", paddingLeft: 1, paddingRight: 1, marginBottom: 1 }}>
      
      {/* Header */}
      <box style={{ justifyContent: "space-between", marginBottom: 1 }}>
        <text style={{ fg: theme.brandLight }}>
          <strong>◆ Migrant Intelligence</strong>
        </text>
        {isStreaming && !thoughtTime ? (
          <text style={{ fg: accentColor }}>
            <strong>+ Thinking...</strong>
          </text>
        ) : thoughtTime ? (
          <text style={{ fg: accentColor }}>
            <strong>+ Thought: {thoughtTime}</strong>
          </text>
        ) : null}
      </box>

      {hasReasoning && (
        <box
          style={{
            flexDirection: "column",
            marginBottom: 1,
            paddingLeft: 1,
            border: ["left"],
            borderColor: theme.textSubtle,
          }}
        >
          <text style={{ fg: theme.textSubtle, marginBottom: 1 }}>
            <strong>Reasoning</strong>
          </text>
          <text style={{ fg: theme.textSubtle }} content={reasoningStream} />
        </box>
      )}

      {response ? (
        <MarkdownRenderer content={response} />
      ) : isThinking ? (
        <text style={{ fg: theme.textSubtle }}>Working...</text>
      ) : null}

    </box>
  );
}