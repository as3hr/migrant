import { Box, Text } from "ink";
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
      return (
        <Box>
          <Text color="#3d7a5c" dimColor>{">"}</Text>
          <Text> </Text>
          <Text color="#5a5a5a">{item.line}</Text>
        </Box>
      );

    case "success":
      return (
        <Box>
          <Text color="#3d7a5c">{"✓"}</Text>
          <Text> </Text>
          <Text color="#e8e8e8">{item.text}</Text>
        </Box>
      );

    case "error":
      return (
        <Box>
          <Text color="#c0392b">{"✗"}</Text>
          <Text> </Text>
          <Text color="#e8e8e8">{item.text}</Text>
        </Box>
      );

    case "blank":
      return <Text> </Text>;

    case "text":
      return <Text color="#a0a0a0">{item.text}</Text>;
  }
}