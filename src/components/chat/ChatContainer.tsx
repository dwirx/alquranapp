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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type ChatStatus = "idle" | "searching" | "thinking" | "generating" | "error";

const ChatContainer = () => {
  const {
    currentSession,
    createSession,
    addMessage,
    updateLastMessage,
    completeStreaming,
  } = useChatHistory();

  const [status, setStatus] = useState<ChatStatus>("idle");
  const [thinkingContent, setThinkingContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, scrollToBottom, status]);

  // Handle sending a message
  const handleSend = async (content: string) => {
    // Ensure we have a session
    let session = currentSession;
    if (!session) {
      session = createSession();
    }

    // Reset state
    setStatus("searching");
    setThinkingContent("");
    setErrorMessage("");
    setLastQuestion(content);

    // Add user message
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    try {
      // Step 1: Vector search for relevant ayat
      let context = "";
      try {
        console.log("[AI Chat] Searching for relevant verses...");
        const vectorResults = await searchQuranVector(content, {
          limit: 5,
          types: ["ayat", "tafsir"],
          minScore: 0.4,
        });
        context = formatVectorResultsForContext(vectorResults);
        console.log("[AI Chat] Found context:", context.substring(0, 200) + "...");
      } catch (error) {
        console.warn("[AI Chat] Vector search failed:", error);
        context = "Tidak dapat mengambil konteks ayat. Jawab berdasarkan pengetahuan umum tentang Al-Quran.";
      }

      setStatus("thinking");

      // Step 2: Prepare messages for LLM
      const systemPrompt = getSystemPrompt(context);
      const chatHistory = currentSession?.messages || [];

      const llmMessages: ChatMessagePayload[] = [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-6).map((msg) => ({
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

      console.log("[AI Chat] Sending to LLM...");

      // Step 4: Stream response
      let hasContent = false;
      await streamAiResponse(
        llmMessages,
        (chunk, thinking) => {
          if (thinking) {
            setThinkingContent((prev) => prev + thinking);
          }
          if (chunk) {
            if (!hasContent) {
              setStatus("generating");
              hasContent = true;
            }
            updateLastMessage(chunk);
          }
        },
        () => {
          console.log("[AI Chat] Response complete");
          completeStreaming();
          setStatus("idle");
          setThinkingContent("");
          toast.success("Jawaban selesai");
        },
        (error) => {
          console.error("[AI Chat] Error:", error);
          setStatus("error");
          setErrorMessage(error.message || "Gagal mendapatkan respons dari AI");
          completeStreaming();
        }
      );
    } catch (error) {
      console.error("[AI Chat] Unexpected error:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga");
    }
  };

  // Retry last question
  const handleRetry = () => {
    if (lastQuestion) {
      handleSend(lastQuestion);
    }
  };

  const messages = currentSession?.messages || [];
  const showSuggestions = messages.length === 0 && status === "idle";
  const isLoading = status !== "idle" && status !== "error";

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

          {(isLoading || status === "error") && (
            <ThinkingIndicator
              thinking={thinkingContent}
              status={status}
              errorMessage={errorMessage}
            />
          )}

          {status === "error" && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            placeholder={
              isLoading
                ? "Menunggu respons AI..."
                : "Ketik pertanyaan tentang Al-Quran..."
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
