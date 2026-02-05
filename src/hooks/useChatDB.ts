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
import { DEFAULT_MODEL } from "@/services/openRouterApi";

export function useChatDB() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModelState] = useState<string>(DEFAULT_MODEL);
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

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);

    await saveSession(newSession);
    await setSetting("currentSessionId", newSession.id);

    return newSession;
  }, [selectedModel]);

  // Add message to current session
  const addMessage = useCallback(
    async (message: ChatMessage) => {
      if (!currentSessionId) return;

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentSessionId) {
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

  // Update last message (for streaming)
  const updateLastMessage = useCallback(
    (content: string, thinking?: string) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentSessionId && session.messages.length > 0) {
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

  // Complete streaming and save
  const completeStreaming = useCallback(async () => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === currentSessionId && session.messages.length > 0) {
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

  return {
    sessions,
    currentSession,
    currentSessionId,
    selectedModel,
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
  };
}
