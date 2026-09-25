/** @jsxImportSource @opentui/react */
import { AuthCheckingView } from "./components/auth/auth_checking_view.tsx";
import { LoginScreen } from "./components/auth/login_screen.tsx";
import { HeroView } from "./components/shell/hero_view.tsx";
import { MainChatView } from "./components/shell/main_chat_view.tsx";
import { useShell } from "./hooks/index.ts";
import { theme } from "./theme.ts";

export interface ShellProps {
  onExit: () => void;
}

export function Shell({ onExit }: ShellProps) {
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
    activeModel,
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
    <box
      style={{
        flexDirection: "column",
        height: dimensions.height,
        overflow: "hidden",
        backgroundColor: theme.bgCanvas,
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 2,
        paddingBottom: 2,
      }}
    >
      {isHero ? (
        <HeroView
          activeModel={activeModel}
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
          activeModel={activeModel}
          input={input}
          onChangeInput={setInput}
          onSubmitInput={handleSubmit}
          user={user}
          formInputProps={formInputProps}
        />
      )}
    </box>
  );
}