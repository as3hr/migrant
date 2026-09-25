/** @jsxImportSource @opentui/react */
import { theme } from "../../theme.ts";

export function ShortcutsCard() {
  return (
    <box
      style={{
        flexDirection: "column",
        paddingLeft: 1,
        paddingRight: 1,
        paddingTop: 1,
        paddingBottom: 1,
        border: true,
        borderColor: theme.borderPrimary,
      }}
    >
      <text style={{ fg: theme.purple }}>
        <strong>⌨ Commands & Keys</strong>
      </text>

      <box style={{ flexDirection: "column", marginTop: 1 }}>
        <box style={{ justifyContent: "space-between" }}>
          <text style={{ fg: theme.brandLight }}><strong>/connect</strong></text>
          <text style={{ fg: theme.textDim }}>Connect DB Pool</text>
        </box>
        <box style={{ justifyContent: "space-between" }}>
          <text style={{ fg: theme.brandLight }}><strong>/sessions</strong></text>
          <text style={{ fg: theme.textDim }}>Switch Session</text>
        </box>
        <box style={{ justifyContent: "space-between" }}>
          <text style={{ fg: theme.brandLight }}><strong>/login</strong></text>
          <text style={{ fg: theme.textDim }}>Sign In Account</text>
        </box>
        <box style={{ justifyContent: "space-between" }}>
          <text style={{ fg: theme.brandLight }}><strong>/logout</strong></text>
          <text style={{ fg: theme.textDim }}>Sign Out</text>
        </box>
        <box style={{ justifyContent: "space-between" }}>
          <text style={{ fg: theme.brandLight }}><strong>/help</strong></text>
          <text style={{ fg: theme.textDim }}>All Commands</text>
        </box>
        <box style={{ justifyContent: "space-between", marginTop: 1 }}>
          <text style={{ fg: theme.textSecondary }}>Ctrl + C</text>
          <text style={{ fg: theme.textDim }}>Quit CLI</text>
        </box>
      </box>
    </box>
  );
}
