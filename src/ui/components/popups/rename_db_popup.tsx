/** @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { theme } from "../../theme.ts";
import { InputPopup } from "./input_popup.tsx";

export interface RenameDbPopupProps {
  databases?: string[] | undefined;
  onSubmit: (paramValue: string) => void;
  onClose: () => void;
}

export function RenameDbPopup({
  databases = [],
  onSubmit,
  onClose,
}: RenameDbPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDbName, setSelectedDbName] = useState<string | null>(null);

  useKeyboard((key) => {
    if (selectedDbName !== null) return;
    
    if (key.name === "escape") {
      onClose();
      return;
    }

    if (key.name === "up") {
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, databases.length - 1)
      );
    } else if (key.name === "down") {
      setSelectedIndex((prev) =>
        prev < databases.length - 1 ? prev + 1 : 0
      );
    } else if (key.name === "return" || key.name == "enter") {
      if (databases.length > 0) {
        const selected = databases[selectedIndex];
        if (selected) setSelectedDbName(selected);
      }
    }
  });

  if (selectedDbName !== null) {
    return (
      <InputPopup
        title={`✏️ Rename ${selectedDbName}`}
        description="Enter the new label for this database:"
        placeholder="e.g. My-Prod-DB"
        submitLabel="rename-db"
        onSubmit={(newName) => {
          onSubmit(`${selectedDbName} ${newName}`);
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <box style={{ flexDirection: "column" }}>
      <box style={{ marginBottom: 1 }}>
        <text style={{ fg: theme.brandLight }}>
          <strong>✏️ Rename Database</strong>
        </text>
      </box>
      {databases.length === 0 ? (
        <box style={{ flexDirection: "column" }}>
          <text style={{ fg: theme.textSecondary }}>No databases connected.</text>
        </box>
      ) : (
        <box style={{ flexDirection: "column" }}>
          <box style={{ marginBottom: 1 }}>
            <text style={{ fg: theme.textSecondary }}>
              Select a database to rename:
            </text>
          </box>
          {databases.map((dbName, index) => {
            const isSelected = index === selectedIndex;
            return (
              <box
                key={dbName}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  paddingLeft: 1,
                  paddingRight: 1,
                }}
              >
                <text style={{ fg: isSelected ? theme.brandLight : theme.textSecondary }}>
                  {isSelected ? `► ${dbName}` : `  ${dbName}`}
                </text>
              </box>
            );
          })}
        </box>
      )}
      <box style={{ marginTop: 1 }}>
        <text style={{ fg: theme.textDim }}>
          Use ↑/↓ to navigate · [Enter] to select · [Esc] to cancel
        </text>
      </box>
    </box>
  );
}
