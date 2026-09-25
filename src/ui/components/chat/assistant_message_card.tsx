/** @jsxImportSource @opentui/react */
import { theme } from "../../theme.ts";
import { MarkdownRenderer } from "./markdown_renderer.tsx";

export interface AssistantMessageCardProps {
  response: string;
  thoughtTime?: string | undefined;
}

export function AssistantMessageCard({
  response,
  thoughtTime,
}: AssistantMessageCardProps) {
  const accentIndex = Math.abs(response.length) % theme.thinkingAccents.length;
  const accentColor = theme.thinkingAccents[accentIndex] ?? theme.accent;

  const isRoutingLog = response.startsWith("Routing to target agent") || response.startsWith("Fetching schema");

  if (isRoutingLog) {
    return (
      <box
        style={{
          flexDirection: "row",
          paddingLeft: 1,
          paddingRight: 1,
          marginBottom: 1,
        }}
      >
        <text style={{ fg: accentColor }}>
          <strong>⚡ LOG:{" "}</strong>
        </text>
        <text style={{ fg: theme.textPrimary }} content={response} />
      </box>
    );
  }

  return (
    <box
      style={{
        flexDirection: "column",
        paddingLeft: 1,
        paddingRight: 1,
        marginBottom: 1,
      }}
    >
      {/* Card Header */}
      <box style={{ justifyContent: "space-between", marginBottom: 1 }}>
        <text style={{ fg: theme.brandLight }}>
          <strong>◆ Migrant Intelligence</strong>
        </text>
        {thoughtTime ? (
          <text style={{ fg: accentColor }}>
            <strong>+ Thought: {thoughtTime}</strong>
          </text>
        ) : null}
      </box>

      {/* Rendered Markdown Body */}
      <MarkdownRenderer content={response} />
    </box>
  );
}
