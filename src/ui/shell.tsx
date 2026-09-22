import { Box, Text } from "ink";
import { ScrollList, type ScrollListRef } from "ink-scroll-list";
import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "./components/common/status_bar.tsx";
import { HeroLogo } from "./components/hero/hero_logo.tsx";
import { Output } from "./components/output.tsx";
import { Prompt } from "./components/prompt.tsx";
import { Spinner } from "./components/spinner.tsx";
import { useHotkeys, useShell, useStdoutDimensions } from "./hooks/index.ts";
import { theme } from "./theme.ts";

import { appContext } from "../domain/index.ts";
import type { IChatSessionsModel } from "../infrastructure/index.ts";
import { appEmitter } from "../utils/emitter.ts";
import { AuthCheckingView } from "./components/auth/auth_checking_view.tsx";
import { LoginScreen } from "./components/auth/login_screen.tsx";
import { CommandParameterPopup } from "./components/autocomplete/command_parameter_popup.tsx";
import { Sidebar } from "./components/sidebar/sidebar.tsx";

interface ShellProps {
  onExit: () => void;
}

const SCROLL_STEP = 3;

export function Shell({ onExit }: ShellProps): JSX.Element {
  const dimensions = useStdoutDimensions();
  const {
    outputs,
    input,
    setInput,
    run,
    user,
    databases,
    sessions,
    activePopup,
    openPopup,
    closePopup,
    handleParameterSubmit,
    spinnerVisible,
    formInputProps,
    handleSubmit,
    auth,
  } = useShell(onExit);

  const listRef = useRef<ScrollListRef>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [session, setCurrentSession] = useState<IChatSessionsModel>();
  useEffect(() => {
    const activeSessionId = appContext.currentChatSessionId;
    if (activeSessionId) {
      void appContext.services.chatSessionService
        .getSession(activeSessionId)
        .then((sess) => {
          if (sess) setCurrentSession(sess);
        });
    }
  
    const handleUpdateSession = ({ updatedSession }: { updatedSession:  IChatSessionsModel }) => {
      setCurrentSession(updatedSession);
    };
  
    appEmitter.on("update-session", handleUpdateSession);
  
    return () => {
      appEmitter.off("update-session", handleUpdateSession);
    };
  }, []);


  const totalItems = outputs.length;

  useEffect(() => {
    setSelectedIndex((prev) => {
      const lastIndex = Math.max(0, totalItems - 1);
      const wasAtBottom = prev >= totalItems - 2;
      return wasAtBottom ? lastIndex : prev;
    });
  }, [totalItems]);

  const scrollUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - SCROLL_STEP));
  }, []);

  const scrollDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(Math.max(0, totalItems - 1), prev + SCROLL_STEP));
  }, [totalItems]);

  useHotkeys({
    onExit,
    onClear: () => {},
    isStreaming: run.kind === "running",
    onScrollUp: scrollUp,
    onScrollDown: scrollDown,
  });

  const isHeroView = outputs.length <= 2 && run.kind === "idle";
  const activeDb = databases?.[0];
  const sidebarWidth = Math.min(34, Math.floor(dimensions.width * 0.3));
  const mainWidth = dimensions.width - (isHeroView ? 0 : sidebarWidth);
  const atBottom = selectedIndex >= totalItems - 1;

  if (auth.authStatus === "checking") {
    return <AuthCheckingView />;
  }

  if (auth.authStatus === "unauthenticated") {
    return (
      <LoginScreen
        onLogin={auth.triggerLogin}
        onExit={onExit}
        isLoggingIn={auth.isLoggingIn}
        {...(auth.loginError !== null ? { loginError: auth.loginError } : {})}
        width={dimensions.width}
      />
    );
  }

  return (
    <Box
      flexDirection="column"
      height={dimensions.height}
      overflow="hidden"
      backgroundColor={theme.bgCanvas}
      padding={2}
    >
      {isHeroView ? (
        <Box
          flexDirection="column"
          width={dimensions.width}
          flexGrow={1}
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          backgroundColor={theme.bgCanvas}
        >
          <HeroLogo />

          <Box marginBottom={1}>
            <Text color={theme.accent}>[Schema RAG · DeepSeek V3]</Text>
          </Box>

          <Box width={Math.min(80, dimensions.width - 4)}>
            {activePopup ? (
              <CommandParameterPopup
                command={activePopup}
                onSubmit={handleParameterSubmit}
                onClose={closePopup}
                databases={databases}
                sessions={sessions}
              />
            ) : (
              <Prompt
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                onTriggerPopup={openPopup}
                {...(user !== undefined ? { user } : {})}
                {...(databases !== undefined ? { databases } : {})}
              />
            )}
          </Box>

          <Box marginTop={1}>
            <Text color={theme.warning}>● </Text>
            <Text color={theme.textDim}>
              Tip: Run{" "}
              <Text color={theme.brandLight}>/connect</Text> to add a
              PostgreSQL database pool
            </Text>
          </Box>
        </Box>
      ) : (
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

                {run.kind === "running" && spinnerVisible && (
                  <Box width={mainWidth} marginTop={1} flexShrink={0}>
                    <Spinner label={run.label} />
                  </Box>
                )}
              </ScrollList>
            </Box>

            <Box width={mainWidth} flexShrink={0}>
              {activePopup ? (
                <CommandParameterPopup
                  command={activePopup}
                  onSubmit={handleParameterSubmit}
                  onClose={closePopup}
                  databases={databases}
                  sessions={sessions}
                />
              ) : run.kind === "idle" ? (
                <Prompt
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  onTriggerPopup={openPopup}
                  {...(user !== undefined ? { user } : {})}
                  {...(databases !== undefined ? { databases } : {})}
                />
              ) : run.kind === "form" ? (
                <Prompt
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  onTriggerPopup={openPopup}
                  label={run.label}
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
            width={sidebarWidth}
          />
        </Box>
      )}


     <StatusBar
        cwd={process.cwd()}
        activeDb={activeDb}
        modelName="deepseek-chat"
        version="1.0.0"
      />
     
    </Box>
  );
}