import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useChatHistory } from "@/hooks/useChatHistory";
import { searchQuranVector, formatVectorResultsForContext } from "@/services/vectorSearchApi";
import { streamAiResponse, getSystemPrompt, ChatMessagePayload } from "@/services/aiChatApi";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ThinkingIndicator from "./ThinkingIndicator";
import SuggestedQuestions from "./SuggestedQuestions";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatContainer = () => {
  const {
    currentSession,
    createSession,
    addMessage,
    updateLastMessage,
    completeStreaming,
  } = useChatHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [thinkingContent, setThinkingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, scrollToBottom]);

  // Handle sending a message
  const handleSend = async (content: string) => {
    // Ensure we have a session
    let session = currentSession;
    if (!session) {
      session = createSession();
    }

    // Add user message
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    setIsLoading(true);
    setIsSearching(true);
    setThinkingContent("");

    try {
      // Step 1: Vector search for relevant ayat
      let context = "";
      try {
        const vectorResults = await searchQuranVector(content, {
          limit: 5,
          types: ["ayat", "tafsir"],
          minScore: 0.5,
        });
        context = formatVectorResultsForContext(vectorResults);
      } catch (error) {
        console.warn("Vector search failed, continuing without context:", error);
        context = "Tidak dapat mengambil konteks ayat. Jawab berdasarkan pengetahuan umum.";
      }

      setIsSearching(false);

      // Step 2: Prepare messages for LLM
      const systemPrompt = getSystemPrompt(context);
      const chatHistory = currentSession?.messages || [];

      const llmMessages: ChatMessagePayload[] = [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-10).map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content },
      ];

      // Step 3: Add placeholder assistant message
      const assistantMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };
      addMessage(assistantMessage);

      // Step 4: Stream response
      await streamAiResponse(
        llmMessages,
        (chunk, thinking) => {
          if (thinking) {
            setThinkingContent((prev) => prev + thinking);
          }
          if (chunk) {
            updateLastMessage(chunk);
          }
        },
        () => {
          completeStreaming();
          setIsLoading(false);
          setThinkingContent("");
        },
        (error) => {
          console.error("AI response error:", error);
          toast.error("Gagal mendapatkan respons AI. Silakan coba lagi.");
          completeStreaming();
          setIsLoading(false);
          setThinkingContent("");
        }
      );
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
      setIsSearching(false);
      setThinkingContent("");
    }
  };

  const messages = currentSession?.messages || [];
  const showSuggestions = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {showSuggestions && (
            <div className="py-8">
              <SuggestedQuestions onSelect={handleSend} disabled={isLoading} />
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <ThinkingIndicator
              thinking={thinkingContent}
              isSearching={isSearching}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
