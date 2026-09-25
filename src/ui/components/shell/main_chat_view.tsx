import { Box, Text } from "ink";
import { ScrollList, type ScrollListRef } from "ink-scroll-list";
import type { JSX, RefObject } from "react";
import type { AskOptions } from "../../../domain/index.ts";
import type { IChatSessionsModel } from "../../../infrastructure/index.ts";
import { theme } from "../../theme.ts";
import type { ParameterCommandType } from "../popups/index.ts";
import { CommandParameterPopup } from "../popups/index.ts";
import { Output, type OutputItem } from "../output.tsx";
import { Prompt } from "../prompt.tsx";
import { Sidebar } from "../sidebar/sidebar.tsx";
import { Spinner } from "../spinner.tsx";

export interface MainChatViewProps {
  mainWidth: number;
  sidebarWidth: number;
  outputs: OutputItem[];
  selectedIndex: number;
  atBottom: boolean;
  listRef: RefObject<ScrollListRef | null>;
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
  listRef,
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
}: MainChatViewProps): JSX.Element {
  return (
    <Box
      flexDirection="row"
      flexGrow={1}
      overflow="hidden"
      backgroundColor={theme.bgCanvas}
    >
      <Box
        flexDirection="column"
        width={mainWidth}
        overflow="hidden"
        backgroundColor={theme.bgCanvas}
      >
        {!atBottom && (
          <Box width={mainWidth} justifyContent="center" flexShrink={0}>
            <Text color={theme.textDim}>
              ↑ PageUp · PageDown ↓ · (at bottom: auto-scrolls)
            </Text>
          </Box>
        )}

        <Box flexGrow={1}>
          <ScrollList
            ref={listRef}
            selectedIndex={selectedIndex}
            scrollAlignment="auto"
            backgroundColor={theme.bgCanvas}
          >
            {outputs.map((item, index) => (
              <Box key={index} width={mainWidth} flexShrink={0}>
                <Output item={item} />
              </Box>
            ))}

            {runKind === "running" && spinnerVisible && (
              <Box width={mainWidth} marginTop={1} flexShrink={0}>
                <Spinner label={runLabel ?? "Working"} />
              </Box>
            )}
          </ScrollList>
        </Box>

        <Box width={mainWidth} flexShrink={0}>
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
        </Box>
      </Box>

      <Sidebar
        databases={databases}
        session={session}
        activeModel={activeModel}
        width={sidebarWidth}
      />
    </Box>
  );
}
