/** @jsxImportSource @opentui/react */
import { createClipboard, createHostClipboard, createRendererClipboardAdapter } from "@opentui/core";
import { useAppContext, useKeyboard } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";
import { theme } from "../theme.ts";
import { AutocompletePopup, SLASH_COMMANDS } from "./popups/autocomplete_popup.tsx";
import type { ParameterCommandType } from "./popups/index.ts";

export interface PromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onTriggerPopup?: (command: ParameterCommandType) => void;

  user?: string;
  databases?: string[];
  label?: string;

  placeholder?: string;
  mask?: string;
}

const PARAM_COMMANDS: ParameterCommandType[] = ["connect", "sessions", "models", "info"];

export function Prompt(props: PromptProps) {
  const placeholder = props.placeholder ?? "Ask anything about your schema...";
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDismissed(false);
  }, [props.value]);

  const app = useAppContext();
  const clipboard = useMemo(() => {
    return createClipboard({
      host: createHostClipboard(),
      terminal: createRendererClipboardAdapter(app.renderer as any),
    });
  }, [app.renderer]);

  useKeyboard(async (key) => {
    if (key.ctrl && key.name === "v") {
      try {
        const result = await clipboard.read({ preferredTypes: ["text/plain"] });
        if (result.status === "read") {
          const text = new TextDecoder().decode(result.representation.bytes);
          props.onChange(props.value + text);
        }
      } catch (e) {
      }
    }
  });

  const handleSelect = (completedText: string) => {
    const cmdName = completedText.trim().replace("/", "") as ParameterCommandType;
    if (PARAM_COMMANDS.includes(cmdName) && props.onTriggerPopup) {
      props.onChange("");
      props.onTriggerPopup(cmdName);
    } else {
      props.onChange(completedText);
    }
  };

  const handleSubmit = (rawValue: string) => {
    const trimmed = rawValue.trim();
    const isPartialSlash = trimmed.startsWith("/") && !trimmed.includes(" ");
    const isExactFullCommand = SLASH_COMMANDS.some(
      (cmd) => `/${cmd.name}` === trimmed
    );

    if (isPartialSlash && !isExactFullCommand && highlightedText) {
      const cmdName = highlightedText.trim().replace("/", "") as ParameterCommandType;
      if (PARAM_COMMANDS.includes(cmdName) && props.onTriggerPopup) {
        props.onChange("");
        props.onTriggerPopup(cmdName);
        return;
      }
      props.onChange("");
      props.onSubmit(highlightedText);
      return;
    }

    props.onSubmit(rawValue);
  };

  return (
    <box style={{ flexDirection: "column", width: "100%", marginBottom: 1 }}>
      {!isDismissed && (
        <AutocompletePopup
          input={props.value}
          onSelect={handleSelect}
          onHighlight={setHighlightedText}
          onClose={() => setIsDismissed(true)}
        />
      )}
      <box
        style={{
          width: "100%",
          backgroundColor: theme.borderPrimary,
          paddingLeft: 1,
          paddingRight: 1,
          paddingTop: 1,
          paddingBottom: 1,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <text style={{ fg: "white" }}>
          <strong>{"❯ "}</strong>
        </text>
        <input
          style={{ flexGrow: 1 }}
          textColor={theme.textPrimary}
          value={props.value}
          focused
          onInput={props.onChange}
          onSubmit={(val: any) => {
            const finalVal = typeof val === "string" ? val : props.value;
            handleSubmit(finalVal);
          }}
          placeholder={placeholder}
          keyBindings={[
            { name: "z", ctrl: true, action: "undo" },
            { name: "return", action: "submit" },
            { name: "kpenter", action: "submit" },
            { name: "linefeed", action: "submit" }
          ]}
        />
      </box>
    </box>
  );
}