import { useState, useEffect, useCallback } from "react";
import {
  initDB,
  getAllSessions,
  saveSession,
  deleteSession as deleteSessionDB,
  clearAllSessions,
  getSetting,
  setSetting,
  migrateFromLocalStorage,
  isIndexedDBSupported,
} from "@/lib/chatDB";
import { ChatSession, ChatMessage } from "@/types/chat";
import { ChatApiConfig } from "@/types/chat";
import {
  DEFAULT_MODEL,
  DEFAULT_OPENROUTER_BASE_URL,
  normalizeOpenRouterBaseURL,
} from "@/services/openRouterApi";

const DEFAULT_API_CONFIG: ChatApiConfig = {
  baseURL: DEFAULT_OPENROUTER_BASE_URL,
  apiKey: "",
  referer: window.location.origin,
  siteTitle: "Al-Quran App",
};

export function useChatDB() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModelState] = useState<string>(DEFAULT_MODEL);
  const [apiConfig, setApiConfigState] = useState<ChatApiConfig>(DEFAULT_API_CONFIG);
  const [customModels, setCustomModelsState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Initialize database and load data
  useEffect(() => {
    async function init() {
      if (!isIndexedDBSupported()) {
        console.warn("[ChatDB] IndexedDB not supported, using fallback");
        setIsLoading(false);
        setIsReady(true);
        return;
      }

      try {
        await initDB();

        // Migrate from localStorage if needed
        await migrateFromLocalStorage();

        // Load sessions
        const loadedSessions = await getAllSessions();
        setSessions(loadedSessions);

        // Load current session ID
        const savedCurrentId = await getSetting<string>("currentSessionId");
        if (savedCurrentId && loadedSessions.some((s) => s.id === savedCurrentId)) {
          setCurrentSessionId(savedCurrentId);
        }

        // Load selected model
        const savedModel = await getSetting<string>("selectedModel");
        if (savedModel) {
          setSelectedModelState(savedModel);
        }

        const savedBaseURL = await getSetting<string>("apiBaseURL");
        const savedApiKey = await getSetting<string>("apiKey");
        const savedReferer = await getSetting<string>("apiReferer");
        const savedSiteTitle = await getSetting<string>("apiSiteTitle");
        const savedCustomModels = await getSetting<string>("customModels");
        setApiConfigState({
          baseURL: normalizeOpenRouterBaseURL(savedBaseURL || DEFAULT_API_CONFIG.baseURL),
          apiKey: savedApiKey || DEFAULT_API_CONFIG.apiKey,
          referer: savedReferer || DEFAULT_API_CONFIG.referer,
          siteTitle: savedSiteTitle || DEFAULT_API_CONFIG.siteTitle,
        });
        if (savedCustomModels) {
          try {
            const parsed = JSON.parse(savedCustomModels) as string[];
            if (Array.isArray(parsed)) {
              setCustomModelsState(parsed.filter(Boolean));
            }
          } catch (error) {
            console.warn("[ChatDB] Failed to parse custom models:", error);
          }
        }

        setIsReady(true);
      } catch (error) {
        console.error("[ChatDB] Init failed:", error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Get current session
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  // Create new session
  const createSession = useCallback(async () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "Percakapan Baru",
      messages: [],
      modelId: selectedModel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Use functional updates to ensure state is set synchronously relative to each other
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);

    await saveSession(newSession);
    await setSetting("currentSessionId", newSession.id);

    return newSession;
  }, [selectedModel]);

  // Add message to current session (or to a specific session if sessionId provided)
  const addMessage = useCallback(
    async (message: ChatMessage, sessionId?: string) => {
      // Use provided sessionId or fall back to currentSessionId
      const targetSessionId = sessionId || currentSessionId;
      if (!targetSessionId) return;

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === targetSessionId) {
            const updatedMessages = [...session.messages, message];
            const title =
              session.messages.length === 0 && message.role === "user"
                ? message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
                : session.title;

            const updated = {
              ...session,
              title,
              messages: updatedMessages,
              updatedAt: Date.now(),
            };

            // Save to IndexedDB
            saveSession(updated);

            return updated;
          }
          return session;
        })
      );
    },
    [currentSessionId]
  );

  // Update last message (for streaming) - also accepts optional sessionId
  const updateLastMessage = useCallback(
    (content: string, thinking?: string, sessionId?: string) => {
      const targetSessionId = sessionId || currentSessionId;
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === targetSessionId && session.messages.length > 0) {
            const messages = [...session.messages];
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "assistant") {
              messages[messages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + content,
                thinking: thinking
                  ? (lastMessage.thinking || "") + thinking
                  : lastMessage.thinking,
              };
            }
            return { ...session, messages, updatedAt: Date.now() };
          }
          return session;
        })
      );
    },
    [currentSessionId]
  );

  // Complete streaming and save - also accepts optional sessionId
  const completeStreaming = useCallback(async (sessionId?: string) => {
    const targetSessionId = sessionId || currentSessionId;
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === targetSessionId && session.messages.length > 0) {
          const messages = [...session.messages];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.role === "assistant") {
            messages[messages.length - 1] = {
              ...lastMessage,
              isStreaming: false,
            };
          }

          const updated = { ...session, messages };

          // Save to IndexedDB
          saveSession(updated);

          return updated;
        }
        return session;
      })
    );
  }, [currentSessionId]);

  // Delete session
  const deleteSessionHandler = useCallback(
    async (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      await deleteSessionDB(sessionId);

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        await setSetting("currentSessionId", "");
      }
    },
    [currentSessionId]
  );

  // Clear all history
  const clearAllHistory = useCallback(async () => {
    setSessions([]);
    setCurrentSessionId(null);
    await clearAllSessions();
    await setSetting("currentSessionId", "");
  }, []);

  // Switch to a session
  const switchSession = useCallback(async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    await setSetting("currentSessionId", sessionId);
  }, []);

  // Set selected model
  const setSelectedModel = useCallback(async (modelId: string) => {
    setSelectedModelState(modelId);
    await setSetting("selectedModel", modelId);
  }, []);

  const setApiConfig = useCallback(async (config: Partial<ChatApiConfig>) => {
    const next = {
      ...apiConfig,
      ...config,
      baseURL: normalizeOpenRouterBaseURL(config.baseURL || apiConfig.baseURL),
    };
    setApiConfigState(next);
    await Promise.all([
      setSetting("apiBaseURL", next.baseURL),
      setSetting("apiKey", next.apiKey),
      setSetting("apiReferer", next.referer),
      setSetting("apiSiteTitle", next.siteTitle),
    ]);
  }, [apiConfig]);

  const setCustomModels = useCallback(async (models: string[]) => {
    const sanitized = Array.from(new Set(models.map((m) => m.trim()).filter(Boolean)));
    setCustomModelsState(sanitized);
    await setSetting("customModels", JSON.stringify(sanitized));
  }, []);

  return {
    sessions,
    currentSession,
    currentSessionId,
    selectedModel,
    apiConfig,
    customModels,
    isLoading,
    isReady,
    createSession,
    addMessage,
    updateLastMessage,
    completeStreaming,
    deleteSession: deleteSessionHandler,
    clearAllHistory,
    switchSession,
    setSelectedModel,
    setApiConfig,
    setCustomModels,
  };
}
