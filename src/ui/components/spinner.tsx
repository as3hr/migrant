import { Text, useAnimation } from "ink";
import type { JSX } from "react";

// Dot-pulse frames — quieter than braille, fits a database tool
const FRAMES = ["·  ", "·· ", "···", " ··", "  ·", "   "];

export function Spinner({ label }: { label: string }): JSX.Element {
  const { frame } = useAnimation({ interval: 120 });
  const frameChar = FRAMES[frame % FRAMES.length] ?? FRAMES[0]!;

  return (
    <Text>
      <Text color="#3d7a5c">{frameChar}</Text>
      {label ? <Text color="#5a5a5a"> {label}...</Text> : null}
    </Text>
  );
}