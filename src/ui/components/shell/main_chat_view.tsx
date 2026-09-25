/** @jsxImportSource @opentui/react */
import type { AskOptions } from "../../../domain/index.ts";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import { Output, type OutputItem } from "../output.tsx";
import type { ParameterCommandType } from "../popups/index.ts";
import { CommandParameterPopup } from "../popups/index.ts";
import { Prompt } from "../prompt.tsx";
import { Sidebar } from "../sidebar/sidebar.tsx";
import { Spinner } from "../spinner.tsx";

export interface MainChatViewProps {
  mainWidth: number;
  sidebarWidth: number;
  outputs: OutputItem[];
  selectedIndex: number;
  atBottom: boolean;
  runKind: "idle" | "running" | "form";
  runLabel?: string | undefined;
  spinnerVisible: boolean;
  activePopup: ParameterCommandType | null;
  onParameterSubmit: (paramValue: string) => void;
  onClosePopup: () => void;
  onTriggerPopup: (type: ParameterCommandType) => void;
  databases?: string[] | undefined;
  sessions: IChatSessionsModel[];
  session?: IChatSessionsModel | undefined;
  activeModel?: string | undefined;
  input: string;
  onChangeInput: (value: string) => void;
  onSubmitInput: (value: string) => void;
  user?: string | undefined;
  formInputProps?: AskOptions;
}

export function MainChatView({
  mainWidth,
  sidebarWidth,
  outputs,
  selectedIndex,
  atBottom,
  runKind,
  runLabel,
  spinnerVisible,
  activePopup,
  onParameterSubmit,
  onClosePopup,
  onTriggerPopup,
  databases,
  sessions,
  session,
  activeModel,
  input,
  onChangeInput,
  onSubmitInput,
  user,
  formInputProps = {},
}: MainChatViewProps) {
  return (
    <box
      style={{
        flexDirection: "row",
        flexGrow: 1,
        overflow: "hidden",
        backgroundColor: theme.bgCanvas,
      }}
    >
      <box
        style={{
          flexDirection: "column",
          width: mainWidth,
          overflow: "hidden",
          backgroundColor: theme.bgCanvas,
        }}
      >
        {!atBottom && (
          <box style={{ width: mainWidth, justifyContent: "center", flexShrink: 0 }}>
            <text style={{ fg: theme.textDim }}>
              ↑ PageUp · PageDown ↓ · (at bottom: auto-scrolls)
            </text>
          </box>
        )}

        <box style={{ flexGrow: 1 }}>
          <scrollbox
            focused
            style={{
              flexGrow: 1,
              rootOptions: { backgroundColor: theme.bgCanvas },
              wrapperOptions: { backgroundColor: theme.bgCanvas },
              viewportOptions: { backgroundColor: theme.bgCanvas },
              contentOptions: { backgroundColor: theme.bgCanvas },
              scrollbarOptions: {
                showArrows: true,
                trackOptions: {
                  foregroundColor: theme.brandLight,
                  backgroundColor: theme.borderPrimary,
                },
              },
            }}
          >
            {outputs.map((item, index) => (
              <box key={index} style={{ width: mainWidth, flexShrink: 0 }}>
                <Output item={item} />
              </box>
            ))}

            {runKind === "running" && spinnerVisible && (
              <box style={{ width: mainWidth, marginTop: 1, flexShrink: 0 }}>
                <Spinner label={runLabel ?? "Working"} />
              </box>
            )}
          </scrollbox>
        </box>

        <box style={{ width: mainWidth, flexShrink: 0 }}>
          {activePopup != null ? (
            <CommandParameterPopup
              command={activePopup}
              onSubmit={onParameterSubmit}
              onClose={onClosePopup}
              databases={databases}
              sessions={sessions}
            />
          ) : runKind === "idle" ? (
            <Prompt
              value={input}
              onChange={onChangeInput}
              onSubmit={onSubmitInput}
              onTriggerPopup={onTriggerPopup}
              {...(user !== undefined ? { user } : {})}
              {...(databases !== undefined ? { databases } : {})}
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
          ) : null}
        </box>
      </box>

      <Sidebar
        databases={databases}
        session={session}
        activeModel={activeModel}
        width={sidebarWidth}
      />
    </box>
  );
}
