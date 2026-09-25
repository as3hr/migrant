/** @jsxImportSource @opentui/react */

export function Banner() {
  return (
    <box style={{ flexDirection: "column", marginBottom: 1 }}>
      <box style={{ flexDirection: "row" }}>
        <text style={{ fg: "#3d7a5c" }}><strong>migrant</strong></text>
        <text style={{ fg: "#3a3a3a" }}>{"  ·  "}</text>
        <text style={{ fg: "#5a5a5a" }}>PostgreSQL schema intelligence</text>
      </box>
    </box>
  );
}