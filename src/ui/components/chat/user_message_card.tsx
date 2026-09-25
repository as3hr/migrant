/** @jsxImportSource @opentui/react */
import { theme } from "../../theme.ts";

export interface UserMessageCardProps {
  prompt: string;
}

export function UserMessageCard({ prompt }: UserMessageCardProps) {
  return (
    <box
      style={{
        flexDirection: "column",
        paddingLeft: 1,
        paddingRight: 1,
        marginBottom: 1,
      }}
    >
      <box style={{ justifyContent: "space-between", marginBottom: 0 }}>
        <text style={{ fg: theme.brandLight }}>
          <strong>❯ USER PROMPT</strong>
        </text>
      </box>

      <box style={{ marginTop: 0 }}>
        <text style={{ fg: theme.brandLight }}>
          <strong>{"> "}</strong>
        </text>
        <text style={{ fg: theme.textPrimary }}>
          <strong>{prompt}</strong>
        </text>
      </box>
    </box>
  );
}
