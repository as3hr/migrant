import { Box } from "ink";
import type { ScrollListRef } from "ink-scroll-list";
import type { JSX } from "react";
import { useRef } from "react";
import { AuthCheckingView } from "./components/auth/auth_checking_view.tsx";
import { LoginScreen } from "./components/auth/login_screen.tsx";
import { HeroView } from "./components/shell/hero_view.tsx";
import { MainChatView } from "./components/shell/main_chat_view.tsx";
import { useShell } from "./hooks/index.ts";
import { theme } from "./theme.ts";

interface ShellProps {
  onExit: () => void;
}

export function Shell({ onExit }: ShellProps): JSX.Element {
  const {
    outputs,
    input,
    setInput,
    run,
    dimensions,
    user,
    databases,
    sessions,
    currentSession,
    activePopup,
    openPopup,
    closePopup,
    handleParameterSubmit,
    spinnerVisible,
    formInputProps,
    handleSubmit,
    auth,
    viewMode,
    selectedIndex,
    atBottom,
  } = useShell(onExit);

  const listRef = useRef<ScrollListRef>(null);

  const availableWidth = Math.max(20, dimensions.width - 4);
  const sidebarWidth = Math.min(34, Math.floor(dimensions.width * 0.3));
  const isHero = viewMode === "hero";
  const mainWidth = availableWidth - (isHero ? 0 : sidebarWidth);

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
      {isHero ? (
        <HeroView
          dimensions={dimensions}
          activePopup={activePopup}
          onParameterSubmit={handleParameterSubmit}
          onClosePopup={closePopup}
          onTriggerPopup={openPopup}
          databases={databases}
          sessions={sessions}
          input={input}
          onChangeInput={setInput}
          onSubmitInput={handleSubmit}
          user={user}
          runKind={run.kind}
          runLabel={run.kind !== "idle" ? run.label : undefined}
          formInputProps={formInputProps}
        />
      ) : (
        <MainChatView
          mainWidth={mainWidth}
          sidebarWidth={sidebarWidth}
          outputs={outputs}
          selectedIndex={selectedIndex}
          atBottom={atBottom}
          listRef={listRef}
          runKind={run.kind}
          runLabel={run.kind !== "idle" ? run.label : undefined}
          spinnerVisible={spinnerVisible}
          activePopup={activePopup}
          onParameterSubmit={handleParameterSubmit}
          onClosePopup={closePopup}
          onTriggerPopup={openPopup}
          databases={databases}
          sessions={sessions}
          session={currentSession}
          input={input}
          onChangeInput={setInput}
          onSubmitInput={handleSubmit}
          user={user}
          formInputProps={formInputProps}
        />
      )}
    </Box>
  );
}