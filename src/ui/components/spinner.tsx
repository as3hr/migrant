import { Text, useAnimation } from "ink";
import type { JSX } from "react";

const FRAMES = [
  "⠋",
  "⠙",
  "⠹",
  "⠸",
  "⠼",
  "⠴",
  "⠦",
  "⠧",
  "⠇",
  "⠏",
];

export function Spinner({ label }: { label: string }): JSX.Element {
  const { frame } = useAnimation({ interval: 80 });
  const frameChar = FRAMES[frame % FRAMES.length] ?? FRAMES[0]!;

  return (
    <Text>
      <Text color="cyan">{frameChar}</Text>
      {label ? <Text> {label}</Text> : null}
    </Text>
  );
}