import { Loader2, Brain } from "lucide-react";

interface ThinkingIndicatorProps {
  thinking?: string;
  isSearching?: boolean;
}

const ThinkingIndicator = ({ thinking, isSearching }: ThinkingIndicatorProps) => {
  return (
    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Brain className="h-4 w-4 text-primary animate-pulse" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>
            {isSearching ? "Mencari ayat relevan..." : "AI sedang berpikir..."}
          </span>
        </div>

        {thinking && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground italic whitespace-pre-wrap">
              {thinking}
            </p>
          </div>
        )}

        {!thinking && !isSearching && (
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ThinkingIndicator;
