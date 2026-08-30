import { Box, Text, useInput } from "ink";
import { useEffect, useState } from "react";
import type { JSX } from "react";

export interface SlashCommandItem {
  name: string;
  argsHint?: string;
  description: string;
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    name: "connect",
    argsHint: "<connection_string>",
    description: "Connect & scan PostgreSQL database",
  },
  {
    name: "sessions",
    argsHint: "",
    description: "List & switch past chat sessions",
  },
  {
    name: "clear",
    argsHint: "",
    description: "Clear terminal screen & outputs",
  },
  {
    name: "represent",
    argsHint: "<db>",
    description: "Open live ER diagram on migrant.monster",
  },
  {
    name: "login",
    argsHint: "",
    description: "Authenticate your Migrant account",
  },
  {
    name: "logout",
    argsHint: "",
    description: "Logout from your Migrant account",
  },
  {
    name: "help",
    argsHint: "",
    description: "Show available commands & descriptions",
  },
];

export interface AutocompletePopupProps {
  input: string;
  onSelect: (completedText: string) => void;
  onClose?: () => void;
}

export function AutocompletePopup({
  input,
  onSelect,
  onClose,
}: AutocompletePopupProps): JSX.Element | null {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Extract search query after leading '/'
  const searchQuery = input.startsWith("/")
    ? input.slice(1).trim().toLowerCase()
    : "";

  // Filter commands matching current query
  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().startsWith(searchQuery)
  );

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle Arrow navigation & Tab/Enter selection
  useInput((_, key) => {
    if (!filteredCommands.length) return;

    if (key.upArrow) {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (key.downArrow) {
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (key.tab) {
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        onSelect(`/${selected.name} `);
      }
    } else if (key.escape) {
      onClose?.();
    }
  });

  if (!input.startsWith("/") || filteredCommands.length === 0) {
    return null;
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="#3d7a5c"
      paddingX={1}
      paddingY={0}
      marginBottom={1}
    >
      <Box marginBottom={1}>
        <Text color="#5a5a5a" dimColor>
          Use ↑/↓ to navigate, Tab to complete
        </Text>
      </Box>

      {filteredCommands.map((cmd, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Box key={cmd.name} justifyContent="space-between" width="100%">
            <Box>
              <Text color={isSelected ? "#3d7a5c" : "#7a7a7a"} bold={isSelected}>
                {isSelected ? "► " : "  "}
                {`/${cmd.name}`}
              </Text>
              {cmd.argsHint ? (
                <Text color="#5a5a5a"> {cmd.argsHint}</Text>
              ) : null}
            </Box>
            <Text color={isSelected ? "#e8e8e8" : "#5a5a5a"}>
              {cmd.description}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
