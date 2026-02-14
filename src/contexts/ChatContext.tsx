import { createContext, useContext, ReactNode } from "react";
import { useChatDB } from "@/hooks/useChatDB";
import { ChatSession, ChatMessage, ChatApiConfig } from "@/types/chat";

// Define the context type
interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | undefined;
  currentSessionId: string | null;
  selectedModel: string;
  apiConfig: ChatApiConfig;
  customModels: string[];
  isLoading: boolean;
  isReady: boolean;
  createSession: () => Promise<ChatSession>;
  addMessage: (message: ChatMessage, sessionId?: string) => Promise<void>;
  updateLastMessage: (content: string, thinking?: string, sessionId?: string) => void;
  completeStreaming: (sessionId?: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearAllHistory: () => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  setSelectedModel: (modelId: string) => Promise<void>;
  setApiConfig: (config: Partial<ChatApiConfig>) => Promise<void>;
  setCustomModels: (models: string[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const chatDB = useChatDB();

  return (
    <ChatContext.Provider value={chatDB}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
