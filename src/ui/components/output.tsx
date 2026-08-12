import { Text } from "ink";
import type { JSX } from "react";

export type OutputItem =
  | { type: "command"; line: string }
  | { type: "text"; text: string }
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | { type: "blank" };

export function Output({ item }: { item: OutputItem }): JSX.Element {
  switch (item.type) {
    case "command":
      return <Text color="gray">&gt; {item.line}</Text>;
    case "success":
      return <Text color="green">✓ {item.text}</Text>;
    case "error":
      return <Text color="red">✗ {item.text}</Text>;
    case "blank":
      return <Text> </Text>;
    case "text":
      return <Text>{item.text}</Text>;
  }
}