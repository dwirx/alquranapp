import { useState, useRef, useEffect, FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSend, disabled, placeholder }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-end gap-2 w-full">
      <div className="flex-1 flex items-end gap-2 p-1.5 rounded-lg border border-border bg-card/50 shadow-sm hover:border-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ketik pertanyaan..."}
          disabled={disabled}
          className="flex-1 min-h-[36px] max-h-[150px] border-0 bg-transparent p-1.5 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground leading-normal"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !input.trim()}
          className="shrink-0 h-8 w-8 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 active:scale-95 mb-0.5 mr-0.5"
        >
          {disabled ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5 ml-0.5" />
          )}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
