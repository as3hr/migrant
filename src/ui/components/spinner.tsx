/** @jsxImportSource @opentui/react */
import { useEffect, useState } from "react";

const FRAMES = ["·  ", "·· ", "···", " ··", "  ·", "   "];

export function Spinner({ label }: { label: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const frameChar = FRAMES[frame];

  return (
    <box style={{ flexDirection: "row" }}>
      <text style={{ fg: "#3d7a5c" }}>{frameChar}</text>
      {label ? <text style={{ fg: "#5a5a5a" }}> {label}...</text> : null}
    </box>
  );
}