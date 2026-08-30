import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";
import { MarkdownRenderer } from "./markdown_renderer.tsx";

export interface AssistantMessageCardProps {
  response: string;
  modelName?: string | undefined;
  thoughtTime?: string | undefined;
}

export function AssistantMessageCard({
  response,
  modelName = "deepseek-chat",
  thoughtTime = "1.4s",
}: AssistantMessageCardProps): JSX.Element {
  const accentIndex = Math.abs(response.length) % theme.thinkingAccents.length;
  const accentColor = theme.thinkingAccents[accentIndex] ?? theme.accent;

  const isRoutingLog = response.startsWith("Routing to target agent") || response.startsWith("Fetching schema");

  if (isRoutingLog) {
    return (
      <Box
        flexDirection="row"
        paddingX={1}
        paddingY={0}
        marginBottom={1}
      >
        <Text color={accentColor} bold>
          ⚡ LOG:{" "}
        </Text>
        <Text color={theme.textPrimary}>{response}</Text>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={0}
      marginBottom={1}
    >
      {/* Card Header */}
      <Box justifyContent="space-between" marginBottom={1}>
        <Text color={theme.brandLight} bold>
          ◆ Migrant Intelligence [{modelName}]
        </Text>
        {thoughtTime ? (
          <Text color={accentColor} bold>+ Thought: {thoughtTime}</Text>
        ) : null}
      </Box>

      {/* Rendered Markdown Body */}
      <MarkdownRenderer content={response} />
    </Box>
  );
}
