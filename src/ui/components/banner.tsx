import { Box, Text } from "ink";
import type { JSX } from "react";

export function Banner(): JSX.Element {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color="#3d7a5c" bold>migrant</Text>
        <Text color="#3a3a3a">{"  ·  "}</Text>
        <Text color="#5a5a5a">PostgreSQL schema intelligence</Text>
      </Box>
    </Box>
  );
}