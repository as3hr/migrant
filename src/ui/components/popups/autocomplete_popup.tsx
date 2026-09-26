/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";

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
    name: "models",
    argsHint: "",
    description: "Select AI Provider & Model",
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
  onHighlight?: (completedText: string | null) => void;
  onClose?: () => void;
}

export function AutocompletePopup({
  input,
  onSelect,
  onHighlight,
  onClose,
}: AutocompletePopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isSlashInput = input.startsWith("/");
  const searchQuery = isSlashInput
    ? input.slice(1).trim().toLowerCase()
    : "";

  const filteredCommands = isSlashInput
    ? SLASH_COMMANDS.filter((cmd) =>
        cmd.name.toLowerCase().startsWith(searchQuery)
      )
    : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (isSlashInput && filteredCommands.length > 0) {
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        onHighlight?.(`/${selected.name} `);
      } else {
        onHighlight?.(null);
      }
    } else {
      onHighlight?.(null);
    }
  }, [input, selectedIndex, filteredCommands.length, isSlashInput]);

  useKeyboard((key) => {
    if (!isSlashInput || filteredCommands.length === 0) return;

    if (key.name === "up") {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (key.name === "down") {
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (key.name === "tab" || key.name === "enter") {
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        onSelect(`/${selected.name} `);
      }
    } else if (key.name === "escape") {
      onClose?.();
    }
  });

  if (!input.startsWith("/") || filteredCommands.length === 0) {
    return null;
  }

  return (
    <box
      style={{
        flexDirection: "column",
        border: true,
        borderColor: "#3d7a5c",
        paddingLeft: 1,
        paddingRight: 1,
        marginBottom: 1,
      }}
    >
      <box style={{ marginBottom: 1 }}>
        <text style={{ fg: "#5a5a5a" }}>
          Use ↑/↓ to navigate, Tab to complete
        </text>
      </box>

      {filteredCommands.map((cmd, index) => {
        const isSelected = index === selectedIndex;
        return (
          <box key={cmd.name} style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <box style={{ flexDirection: "row" }}>
              <text style={{ fg: isSelected ? "#3d7a5c" : "#7a7a7a" }}>
                {isSelected ? `► /${cmd.name}` : `  /${cmd.name}`}
              </text>
              {cmd.argsHint ? (
                <text style={{ fg: "#5a5a5a" }}>{` ${cmd.argsHint}`}</text>
              ) : null}
            </box>
            <text style={{ fg: isSelected ? "#e8e8e8" : "#5a5a5a" }}>{cmd.description}</text>
          </box>
        );
      })}
    </box>
  );
}
