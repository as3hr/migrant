import { useCallback, useEffect, useState } from "react";
import { appContext } from "../../domain/index.ts";
import { supabase, type IChatSessionsModel } from "../../infrastructure/index.ts";
import { emitEvent } from "../../utils/emitter.ts";
import { SYS_DEFAULT_MODEL } from "../../utils/index.ts";
import type { UseAuthReturn } from "./useAuth.ts";

export interface UseWorkspaceStatusReturn {
  user: string | undefined;
  databases: string[] | undefined;
  sessions: IChatSessionsModel[];
  currentSession: IChatSessionsModel | undefined;
  activeModel: string;
  refreshStatus: () => Promise<void>;
}

export function useWorkspaceStatus(auth: UseAuthReturn): UseWorkspaceStatusReturn {
  const [user, setUser] = useState<string>();
  const [databases, setDatabases] = useState<string[]>();
  const [sessions, setSessions] = useState<IChatSessionsModel[]>([]);
  const [currentSession, setCurrentSession] = useState<IChatSessionsModel>();
  const [activeModel, setActiveModel] = useState<string>(
    appContext.selectedModel?.modelId || SYS_DEFAULT_MODEL
  );

  const refreshStatus = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data?.session?.user.email ?? undefined);
    setDatabases(appContext.workspace.databases.map((db) => db.name));
    const sessionList = await appContext.services.chatSessionService.getSessions();
    setSessions(sessionList);

    const activeSessionId = appContext.currentChatSessionId;
    if (activeSessionId) {
      const sess = await appContext.services.chatSessionService.getSession(activeSessionId);
      if (sess) setCurrentSession(sess);
    }
  }, []);

  useEffect(() => {
    const handler = ({ model }: { model: string }) => {
      setActiveModel(model);
    };

    emitEvent.on("update-model", handler);
    return () => {
      emitEvent.off("update-model", handler);
    };
  }, []);

  useEffect(() => {
    const handleUpdateSession = ({ updatedSession }: { updatedSession: IChatSessionsModel | null }) => {
      if (updatedSession === null) {
        setCurrentSession(undefined);
      } else {
        setCurrentSession(updatedSession);
      }
      void refreshStatus();
    };

    emitEvent.on("update-session", handleUpdateSession);
    return () => {
      emitEvent.off("update-session", handleUpdateSession);
    };
  }, [refreshStatus]);

  useEffect(() => {
    const handleUpdateDb = () => {
      void refreshStatus();
    };

    emitEvent.on("update-databases", handleUpdateDb);
    return () => {
      emitEvent.off("update-databases", handleUpdateDb);
    };
  }, [refreshStatus]);

  useEffect(() => {
    if (auth.authStatus === "authenticated") {
      void refreshStatus();
    }

    const handler = () => auth.checkAuth();
    emitEvent.on("logout", handler);
    return () => {
      emitEvent.off("logout", handler);
    };
  }, [auth.authStatus, refreshStatus]);

  return {
    user,
    databases,
    sessions,
    currentSession,
    activeModel,
    refreshStatus,
  };
}
