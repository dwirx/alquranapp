import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { extractQuranTags } from "@/lib/quranParser";
import QuranCard from "./QuranCard";
import ShalatCard from "./ShalatCard";
import DoaCard from "./DoaCard";
import ImsakiyahCard from "./ImsakiyahCard";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

// Custom components for markdown rendering
const MarkdownComponents = {
  // Headings
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-xl font-bold mt-4 mb-2 text-foreground">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-lg font-bold mt-3 mb-2 text-foreground">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-base font-semibold mt-2 mb-1 text-foreground">{children}</h3>
  ),
  // Paragraphs
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 leading-relaxed">{children}</p>
  ),
  // Strong/Bold
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  // Emphasis/Italic
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-primary/90">{children}</em>
  ),
  // Lists
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-sm">{children}</li>
  ),
  // Blockquote
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary/50 pl-4 py-1 my-2 bg-primary/5 rounded-r italic">
      {children}
    </blockquote>
  ),
  // Code
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
          {children}
        </code>
      );
    }
    return (
      <code className="block bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto my-2">
        {children}
      </code>
    );
  },
  // Pre (code blocks)
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-muted rounded-lg overflow-x-auto my-2">{children}</pre>
  ),
  // Links
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  // Horizontal rule
  hr: () => <hr className="my-4 border-border" />,
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  // Parse content for tags (assistant only)
  const renderContent = () => {
    if (isUser) {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }

    const { segments } = extractQuranTags(message.content);

    return (
      <div className="space-y-3">
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
          if (segment.type === "shalat") {
            return <ShalatCard key={index} />;
          }
          if (segment.type === "doa") {
            return <DoaCard key={index} query={segment.query || ""} />;
          }
          if (segment.type === "imsakiyah") {
            return <ImsakiyahCard key={index} />;
          }
          return (
            <div key={index} className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {segment.content}
              </ReactMarkdown>
            </div>
          );
        })}
        {message.isStreaming && (
          <span className="inline-block w-2 h-5 bg-primary animate-pulse rounded-sm" />
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
