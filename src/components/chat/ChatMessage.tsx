import { User, Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
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

// Code block component with copy button
const CodeBlock = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3">
      {language && (
        <div className="absolute top-0 left-0 px-2 py-1 text-[10px] font-mono text-muted-foreground bg-muted/80 rounded-tl-lg rounded-br-lg border-b border-r border-border/50">
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      <pre className={cn(
        "bg-zinc-900 dark:bg-zinc-950 text-zinc-100 rounded-lg overflow-x-auto p-4",
        language && "pt-8"
      )}>
        <code className="text-sm font-mono leading-relaxed">
          {children}
        </code>
      </pre>
    </div>
  );
};

// Custom components for markdown rendering
const MarkdownComponents = {
  // Headings
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-xl font-bold mt-5 mb-3 text-foreground border-b border-border/50 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-lg font-bold mt-4 mb-2 text-foreground flex items-center gap-2">
      <span className="w-1 h-5 bg-primary rounded-full" />
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-base font-semibold mt-3 mb-2 text-foreground">{children}</h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h4>
  ),
  // Paragraphs
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 leading-relaxed text-[15px]">{children}</p>
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
    <ul className="list-none mb-3 space-y-1.5 pl-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1.5 pl-1">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-[15px] flex items-start gap-2">
      <span className="text-primary mt-2 flex-shrink-0">•</span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  // Blockquote
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary/60 pl-4 py-2 my-3 bg-primary/5 rounded-r-lg">
      <div className="italic text-muted-foreground">{children}</div>
    </blockquote>
  ),
  // Inline code
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    // If it has a className, it's a code block (handled by pre)
    if (className) {
      return <code className={className}>{children}</code>;
    }
    // Inline code
    return (
      <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  },
  // Pre (code blocks) - use custom CodeBlock component
  pre: ({ children }: { children?: React.ReactNode }) => {
    // Extract code element and its props
    const codeElement = children as React.ReactElement;
    if (codeElement?.props) {
      return (
        <CodeBlock className={codeElement.props.className}>
          {codeElement.props.children}
        </CodeBlock>
      );
    }
    return <pre className="bg-muted rounded-lg overflow-x-auto my-2 p-3">{children}</pre>;
  },
  // Links
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
    >
      {children}
    </a>
  ),
  // Horizontal rule
  hr: () => <hr className="my-4 border-border/50" />,
  // Tables
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border border-border rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-muted/50">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody className="divide-y divide-border">{children}</tbody>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-3 py-2 text-left text-sm font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2 text-sm">{children}</td>
  ),
  // Images
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg my-3 border border-border"
      loading="lazy"
    />
  ),
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
            return (
              <ShalatCard
                key={index}
                provinsi={segment.provinsi}
                kabkota={segment.kabkota}
              />
            );
          }
          if (segment.type === "doa") {
            return <DoaCard key={index} query={segment.query || ""} />;
          }
          if (segment.type === "imsakiyah") {
            return (
              <ImsakiyahCard
                key={index}
                provinsi={segment.provinsi}
                kabkota={segment.kabkota}
              />
            );
          }
          return (
            <div key={index} className="prose-chat max-w-none">
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
        "flex gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-sm mt-1",
          isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border/50 text-primary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "flex-1 min-w-0 max-w-[calc(100%-2.5rem)] sm:max-w-[88%] lg:max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm",
          isUser
            ? "bubble-user text-primary-foreground rounded-br-sm"
            : "bubble-bot text-foreground rounded-bl-sm"
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatMessage;
