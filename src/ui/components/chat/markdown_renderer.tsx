import { Box, Text } from "ink";
import type { JSX } from "react";
import { theme } from "../../theme.ts";

export interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps): JSX.Element {
  if (!content) return <Text color={theme.textDim}>...</Text>;

  const blocks = parseMarkdownBlocks(content);

  return (
    <Box flexDirection="column" gap={1}>
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <Box
              key={idx}
              flexDirection="column"
              paddingX={1}
              paddingY={0}
            >
              <Box justifyContent="space-between" marginBottom={0}>
                <Text color={theme.brandLight} bold>
                  [{block.language ? block.language.toUpperCase() : "SQL"}]
                </Text>
              </Box>
              <Text color={theme.accent}>{block.code}</Text>
            </Box>
          );
        }

        if (block.type === "table") {
          return (
            <Box key={idx} flexDirection="column" marginY={0}>
              <Text color={theme.brandLight}>{block.rawTable}</Text>
            </Box>
          );
        }

        return (
          <Text key={idx} color={theme.textPrimary}>
            {block.text}
          </Text>
        );
      })}
    </Box>
  );
}

interface CodeBlock {
  type: "code";
  language: string;
  code: string;
}

interface TableBlock {
  type: "table";
  rawTable: string;
}

interface TextBlock {
  type: "text";
  text: string;
}

type ParsedBlock = CodeBlock | TableBlock | TextBlock;

function parseMarkdownBlocks(rawText: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = rawText.split("\n");
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines: string[] = [];
  let textBuffer: string[] = [];

  const flushTextBuffer = () => {
    if (textBuffer.length > 0) {
      const text = textBuffer.join("\n").trim();
      if (text) {
        if (text.includes("|") && text.includes("-|-")) {
          blocks.push({ type: "table", rawTable: text });
        } else {
          blocks.push({ type: "text", text });
        }
      }
      textBuffer = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push({
          type: "code",
          language: codeLang || "sql",
          code: codeLines.join("\n"),
        });
        codeLines = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        flushTextBuffer();
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, "").trim();
      }
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else {
      textBuffer.push(line);
    }
  }

  flushTextBuffer();

  if (inCodeBlock && codeLines.length > 0) {
    blocks.push({
      type: "code",
      language: codeLang || "sql",
      code: codeLines.join("\n"),
    });
  }

  return blocks;
}
