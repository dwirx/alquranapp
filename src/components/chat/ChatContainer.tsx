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
import { RefreshCw, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatStatus = "idle" | "searching" | "thinking" | "generating" | "error";

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
  const [thinkingContent, setThinkingContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      session = await createSession();
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
    await addMessage(userMessage);

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
      await addMessage(assistantMessage);

      console.log("[AI Chat] Sending to LLM with model:", selectedModel);

      // Step 4: Stream response with abort controller
      abortControllerRef.current = new AbortController();
      let hasContent = false;
      await streamAiResponse(
        llmMessages,
        selectedModel,
        (chunk: string, thinking?: string) => {
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
          abortControllerRef.current = null;
          completeStreaming();
          setStatus("idle");
          setThinkingContent("");
          toast.success("Jawaban selesai");
        },
        (error: Error) => {
          if (error.name === "AbortError") {
            console.log("[AI Chat] Request aborted");
            return;
          }
          console.error("[AI Chat] Error:", error);
          setStatus("error");
          setErrorMessage(error.message || "Gagal mendapatkan respons dari AI");
          completeStreaming();
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

  return (
    <div className="flex flex-col h-full">
      {/* Header with Model Selector */}
      <ChatHeader
        selectedModelId={selectedModel}
        onSelectModel={handleModelChange}
        disabled={isLoading}
      />

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
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

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {isLoading ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStop}
              className="gap-2 shrink-0"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop
            </Button>
          ) : null}
          <div className="flex-1">
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
    </div>
  );
};

export default ChatContainer;
