import { useCallback, useEffect, useState } from "react";
import { appContext } from "../../domain/index.ts";
import { supabase, type IChatSessionsModel } from "../../infrastructure/index.ts";
import { appEmitter } from "../../utils/emitter.ts";
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

    appEmitter.on("update-model", handler);
    return () => {
      appEmitter.off("update-model", handler);
    };
  }, []);

  useEffect(() => {
    const handleUpdateSession = ({ updatedSession }: { updatedSession: IChatSessionsModel }) => {
      setCurrentSession(updatedSession);
      void refreshStatus();
    };

    appEmitter.on("update-session", handleUpdateSession);
    return () => {
      appEmitter.off("update-session", handleUpdateSession);
    };
  }, [refreshStatus]);

  useEffect(() => {
    if (auth.authStatus === "authenticated") {
      void refreshStatus();
    }

    const handler = () => auth.checkAuth();
    appEmitter.on("logout", handler);
    return () => {
      appEmitter.off("logout", handler);
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
