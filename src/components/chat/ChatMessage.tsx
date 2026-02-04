import { User, Bot } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { extractQuranTags } from "@/lib/quranParser";
import QuranCard from "./QuranCard";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  // Parse content for quran tags (assistant only)
  const renderContent = () => {
    if (isUser) {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }

    const { segments } = extractQuranTags(message.content);

    return (
      <div className="space-y-2">
        {segments.map((segment, index) => {
          if (segment.type === "quran") {
            return (
              <QuranCard
                key={index}
                surah={segment.surah!}
                ayat={segment.ayat!}
                arabic={segment.content}
              />
            );
          }
          return (
            <div key={index} className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
              {segment.content}
            </div>
          );
        })}
        {message.isStreaming && (
          <span className="inline-block w-2 h-5 bg-primary animate-pulse" />
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "flex-1 max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted rounded-tl-sm"
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatMessage;
