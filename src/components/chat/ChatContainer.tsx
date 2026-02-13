import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useChat } from "@/contexts/ChatContext";
import { searchQuranVector, formatVectorResultsForContext } from "@/services/vectorSearchApi";
import { streamAiResponse, getSystemPrompt, ChatMessagePayload } from "@/services/aiChatApi";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ThinkingIndicator from "./ThinkingIndicator";
import SuggestedQuestions from "./SuggestedQuestions";
import { ChatHeader } from "./ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Square, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatStatus = "idle" | "searching" | "thinking" | "generating" | "error";

// Models that support reasoning/thinking tokens
const REASONING_MODEL_PATTERNS = [
  "deepseek-r1",
  "deepseek/deepseek-r1",
  "o1-preview",
  "o1-mini",
  "o3-mini",
  "qwq",
  "reasoning",
];

function isReasoningModel(modelId: string): boolean {
  const lowerId = modelId.toLowerCase();
  return REASONING_MODEL_PATTERNS.some(pattern => lowerId.includes(pattern));
}

const ChatContainer = () => {
  const {
    currentSession,
    createSession,
    addMessage,
    updateLastMessage,
    completeStreaming,
    selectedModel,
    setSelectedModel,
    isLoading: isDBLoading,
    isReady,
  } = useChat();

  const [status, setStatus] = useState<ChatStatus>("idle");
  const [thinkingContent, setThinkingContent] = useState<string>("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasThinkingTokens, setHasThinkingTokens] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  // Handle scroll to show/hide button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, thinkingContent, status]);

  // Handle sending a message
  const handleSend = async (content: string) => {
    // Ensure we have a session
    let session = currentSession;
    if (!session) {
      session = await createSession();
    }

    // Capture the session ID to use consistently throughout this request
    // This prevents race conditions with async state updates
    const sessionId = session.id;

    // Reset state
    setStatus("searching");
    setThinkingContent("");
    setHasThinkingTokens(false);
    setErrorMessage("");
    setLastQuestion(content);

    // Capture chat history BEFORE adding the new user message
    // Use session.messages which is the most up-to-date from state or newly created session
    const chatHistory = session?.messages || [];

    // Add user message with explicit session ID
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    await addMessage(userMessage, sessionId);

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
      // Use the captured chatHistory which contains messages from the correct session
      const systemPrompt = getSystemPrompt(context);

      const llmMessages: ChatMessagePayload[] = [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-6).map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content },
      ];

      // Step 3: Add placeholder assistant message with explicit session ID
      const assistantMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };
      await addMessage(assistantMessage, sessionId);

      console.log("[AI Chat] Sending to LLM with model:", selectedModel);
      const modelIsReasoning = isReasoningModel(selectedModel);
      console.log("[AI Chat] Is reasoning model:", modelIsReasoning);

      // Step 4: Stream response with abort controller
      abortControllerRef.current = new AbortController();
      let hasContent = false;
      let thinkingDetected = false;

      await streamAiResponse(
        llmMessages,
        selectedModel,
        (chunk: string, thinking?: string) => {
          // Handle thinking/reasoning tokens
          if (thinking) {
            if (!thinkingDetected) {
              thinkingDetected = true;
              setHasThinkingTokens(true);
              console.log("[AI Chat] Thinking tokens detected");
            }
            setThinkingContent((prev) => prev + thinking);
          }

          // Handle actual content
          if (chunk) {
            if (!hasContent) {
              setStatus("generating");
              hasContent = true;
              console.log("[AI Chat] First content chunk received");
            }
            updateLastMessage(chunk, undefined, sessionId);
          }
        },
        () => {
          console.log("[AI Chat] Response complete, hasContent:", hasContent, "thinkingDetected:", thinkingDetected);
          abortControllerRef.current = null;
          completeStreaming(sessionId);
          setStatus("idle");
          setThinkingContent("");
          setHasThinkingTokens(false);

          if (hasContent) {
            toast.success("Jawaban selesai");
          } else if (thinkingDetected) {
            // Model only sent thinking without content - this can happen with some reasoning models
            toast.info("AI selesai berpikir (tidak ada konten)");
          } else {
            toast.warning("Tidak ada respons dari AI");
          }
        },
        (error: Error) => {
          if (error.name === "AbortError") {
            console.log("[AI Chat] Request aborted");
            completeStreaming(sessionId);
            setStatus("idle");
            setThinkingContent("");
            setHasThinkingTokens(false);
            return;
          }
          console.error("[AI Chat] Error:", error);
          setStatus("error");
          setErrorMessage(error.message || "Gagal mendapatkan respons dari AI");
          completeStreaming(sessionId);
        },
        abortControllerRef.current.signal
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

  // Stop generation
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      completeStreaming();
      setStatus("idle");
      setThinkingContent("");
      toast.info("Generasi dihentikan");
    }
  }, [completeStreaming]);

  // Handle model change
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    toast.success(`Model diubah ke ${modelId.split("/").pop()}`);
  };

  // Show loading while DB initializes
  if (isDBLoading || !isReady) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  const messages = currentSession?.messages || [];
  const showSuggestions = messages.length === 0 && status === "idle";
  const isLoading = status !== "idle" && status !== "error";
  const statusLabel =
    status === "searching"
      ? "Mencari ayat terkait..."
      : status === "thinking"
        ? "AI sedang berpikir..."
        : status === "generating"
          ? "AI sedang menulis jawaban..."
          : null;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header with Model Selector */}
      <ChatHeader
        selectedModelId={selectedModel}
        onSelectModel={handleModelChange}
        disabled={isLoading}
      />

      {/* Messages Area */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 min-h-0 px-3 sm:px-4 lg:px-6"
        onScroll={handleScroll}
      >
        <div className="max-w-xl mx-auto py-4 sm:py-5 space-y-5 sm:space-y-6 pb-48 lg:pb-36">
          {statusLabel && (
            <div className="flex justify-center animate-in fade-in-0 duration-300">
              <span className="text-xs sm:text-sm px-3 py-1 rounded-full border border-border bg-muted/60 text-muted-foreground">
                {statusLabel}
              </span>
            </div>
          )}

          {showSuggestions && (
            <div className="py-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <SuggestedQuestions onSelect={handleSend} disabled={isLoading} />
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "animate-in fade-in-0 duration-300",
                index === messages.length - 1 && "slide-in-from-bottom-2"
              )}
            >
              <ChatMessage message={message} />
            </div>
          ))}

          {(isLoading || status === "error") && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <ThinkingIndicator
                thinking={thinkingContent}
                status={status}
                errorMessage={errorMessage}
                hasThinkingTokens={hasThinkingTokens}
              />
            </div>
          )}

          {status === "error" && (
            <div className="flex justify-center animate-in fade-in-0 duration-200">
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

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-[calc(var(--bottom-nav-height)+6rem)] lg:bottom-28 right-4 lg:right-8 z-20 animate-in fade-in slide-in-from-bottom-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-md bg-background/90 border border-border/50 hover:bg-background"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-5 w-5 text-primary" />
          </Button>
        </div>
      )}

      {/* Input Area - Floating Island (Fixed Position) */}
      <div className="fixed lg:absolute bottom-[var(--bottom-nav-height)] lg:bottom-4 left-0 right-0 z-20 flex justify-center px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:pb-0 pointer-events-none">
        <div className="w-full max-w-xl bg-background/40 backdrop-blur-xl border border-border/50 rounded-2xl shadow-elevated p-1.5 pointer-events-auto">
          <div className="flex items-end gap-2">
            {isLoading ? (
              <Button
                variant="destructive"
                size="icon"
                onClick={handleStop}
                className="h-9 w-9 rounded-lg shrink-0 mb-0.5"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : null}
            <div className="flex-1 min-w-0">
              <ChatInput
                onSend={handleSend}
                disabled={isLoading}
                placeholder={
                  isLoading
                    ? "Sedang merespons..."
                    : "Tanya Ustadz..."
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
