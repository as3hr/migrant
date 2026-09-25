/** @jsxImportSource @opentui/react */
import { theme } from "../../theme.ts";

export interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return <text style={{ fg: theme.textDim }}>...</text>;

  const blocks = parseMarkdownBlocks(content);

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <box
              key={idx}
              style={{
                flexDirection: "column",
                paddingLeft: 1,
                paddingRight: 1,
              }}
            >
              <box style={{ justifyContent: "space-between", marginBottom: 0 }}>
                <text style={{ fg: theme.brandLight }}>
                  <strong>[{block.language ? block.language.toUpperCase() : "SQL"}]</strong>
                </text>
              </box>
              <text style={{ fg: theme.accent }} content={block.code} />
            </box>
          );
        }

        if (block.type === "table") {
          return (
            <box key={idx} style={{ flexDirection: "column" }}>
              <text style={{ fg: theme.brandLight }} content={block.rawTable} />
            </box>
          );
        }

        return (
          <text key={idx} style={{ fg: theme.textPrimary }} wrapMode="word" content={block.text} />
        );

      })}
    </box>
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
