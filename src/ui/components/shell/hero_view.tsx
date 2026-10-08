/** @jsxImportSource @opentui/react */
import type { AskOptions } from "../../../domain/index.ts";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import { HeroLogo } from "../hero/hero_logo.tsx";
import { Output, type OutputItem } from "../output.tsx";
import type { ParameterCommandType } from "../popups/index.ts";
import { CommandParameterPopup } from "../popups/index.ts";
import { Prompt } from "../prompt.tsx";

export interface HeroViewProps {
  dimensions: { width: number; height: number };
  outputs: OutputItem[];
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
  outputs,
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

      <box 
        style={{ 
          position: "absolute",
          top: 1,
          right: 2,
          flexDirection: "column",
          alignItems: "flex-end",
          zIndex: 10
        }}
      >
        {outputs
          .filter(o => o.type === "success" || o.type === "error" || o.type === "text")
          .slice(-3)
          .map((item, i) => (
            <box key={`out-${i}`} style={{ marginBottom: 1 }}>
              <Output item={item} />
            </box>
          ))}
      </box>

      <box style={{ width: Math.min(80, dimensions.width - 4) }}>
        {runKind === "form" ? (
          <Prompt
            value={input}
            onChange={onChangeInput}
            onSubmit={onSubmitInput}
            onTriggerPopup={onTriggerPopup}
            isActive={activePopup == null}
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
            isActive={activePopup == null}
            {...(user !== undefined ? { user } : {})}
            {...(databases !== undefined ? { databases } : {})}
          />
        )}
      </box>

      <box style={{ marginTop: 2, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {databases && databases.length > 0 ? (
          <box style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <text style={{ fg: theme.textSecondary, marginBottom: 1 }}>
              <strong>Connected Databases</strong>
            </text>
            {databases.map((dbName) => (
              <text key={dbName} style={{ fg: theme.brandLight }}>
                {dbName}
              </text>
            ))}
          </box>
        ) : (
          <box style={{ flexDirection: "row" }}>
            <text style={{ fg: theme.warning }}>● </text>
            <text style={{ fg: theme.textDim }}>Tip: Run </text>
            <text style={{ fg: theme.brandLight }}>/connect</text>
            <text style={{ fg: theme.textDim }}> to add a database</text>
          </box>
        )}
      </box>

      <box style={{ marginTop: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <text style={{ fg: theme.success }}>{`${user ?? ""} ${activeModel ? " - " + activeModel : ""}`}</text>
      </box>

      {activePopup != null && (
        <box style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
          <CommandParameterPopup
            command={activePopup}
            onSubmit={onParameterSubmit}
            onClose={onClosePopup}
            databases={databases}
            sessions={sessions}
          />
        </box>
      )}
    </box>
  );
}
