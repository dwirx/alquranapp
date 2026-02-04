import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { ChatSession, ChatMessage } from "@/types/chat";

export function useChatHistory() {
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>(
    "ai-chat-sessions",
    []
  );
  const [currentSessionId, setCurrentSessionId] = useLocalStorage<
    string | null
  >("ai-chat-current", null);

  // Get current session
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  // Create new session
  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "Percakapan Baru",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession;
  }, [setSessions, setCurrentSessionId]);

  // Add message to current session
  const addMessage = useCallback(
    (message: ChatMessage) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === currentSessionId) {
            const updatedMessages = [...session.messages, message];
            // Update title from first user message
            const title =
              session.messages.length === 0 && message.role === "user"
                ? message.content.slice(0, 50) +
                  (message.content.length > 50 ? "..." : "")
                : session.title;
            return {
              ...session,
              title,
              messages: updatedMessages,
              updatedAt: Date.now(),
            };
          }
          return session;
        })
      );
    },
    [currentSessionId, setSessions]
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
    [currentSessionId, setSessions]
  );

  // Mark streaming complete
  const completeStreaming = useCallback(() => {
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
          return { ...session, messages };
        }
        return session;
      })
    );
  }, [currentSessionId, setSessions]);

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
    },
    [currentSessionId, setSessions, setCurrentSessionId]
  );

  // Clear all history
  const clearAllHistory = useCallback(() => {
    setSessions([]);
    setCurrentSessionId(null);
  }, [setSessions, setCurrentSessionId]);

  // Switch to a session
  const switchSession = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
    },
    [setCurrentSessionId]
  );

  return {
    sessions,
    currentSession,
    currentSessionId,
    createSession,
    addMessage,
    updateLastMessage,
    completeStreaming,
    deleteSession,
    clearAllHistory,
    switchSession,
  };
}
