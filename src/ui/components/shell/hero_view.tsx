/** @jsxImportSource @opentui/react */
import type { AskOptions } from "../../../domain/index.ts";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import { HeroLogo } from "../hero/hero_logo.tsx";
import type { ParameterCommandType } from "../popups/index.ts";
import { CommandParameterPopup } from "../popups/index.ts";
import { Prompt } from "../prompt.tsx";

export interface HeroViewProps {
  dimensions: { width: number; height: number };
  activePopup: ParameterCommandType | null;
  onParameterSubmit: (paramValue: string) => void;
  onClosePopup: () => void;
  onTriggerPopup: (type: ParameterCommandType) => void;
  databases?: string[] | undefined;
  sessions: IChatSessionsModel[];
  input: string;
  onChangeInput: (value: string) => void;
  onSubmitInput: (value: string) => void;
  user?: string | undefined;
  runKind: "idle" | "running" | "form";
  runLabel?: string | undefined;
  activeModel: string | undefined;
  formInputProps?: AskOptions;
}

export function HeroView({
  dimensions,
  activePopup,
  onParameterSubmit,
  onClosePopup,
  onTriggerPopup,
  databases,
  sessions,
  input,
  onChangeInput,
  onSubmitInput,
  user,
  runKind,
  runLabel,
  formInputProps = {},
  activeModel,
}: HeroViewProps) {
  return (
    <box
      style={{
        flexDirection: "column",
        width: dimensions.width,
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: theme.bgCanvas,
      }}
    >
      <HeroLogo />

      <box style={{ width: Math.min(80, dimensions.width - 4) }}>
        {activePopup ? (
          <CommandParameterPopup
            command={activePopup}
            onSubmit={onParameterSubmit}
            onClose={onClosePopup}
            databases={databases}
            sessions={sessions}
          />
        ) : runKind === "form" ? (
          <Prompt
            value={input}
            onChange={onChangeInput}
            onSubmit={onSubmitInput}
            onTriggerPopup={onTriggerPopup}
            {...(runLabel !== undefined ? { label: runLabel } : {})}
            {...(formInputProps.placeholder !== undefined
              ? { placeholder: formInputProps.placeholder }
              : {})}
            {...(formInputProps.mask !== undefined
              ? { mask: formInputProps.mask }
              : {})}
          />
        ) : (
          <Prompt
            value={input}
            onChange={onChangeInput}
            onSubmit={onSubmitInput}
            onTriggerPopup={onTriggerPopup}
            {...(user !== undefined ? { user } : {})}
            {...(databases !== undefined ? { databases } : {})}
          />
        )}
      </box>

      <box style={{ marginTop: 1, flexDirection: "row" }}>
        <text style={{ fg: theme.warning }}>● </text>
        <text style={{ fg: theme.textDim }}>Tip: Run </text>
        <text style={{ fg: theme.brandLight }}>/connect</text>
        <text style={{ fg: theme.textDim }}> to add a PostgreSQL database pool</text>
      </box>
      <box style={{ marginTop: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <text style={{ fg: theme.success }}>{`${user ?? ""} - ${activeModel ?? ""}`}</text>
      </box>
    </box>
  );
}
