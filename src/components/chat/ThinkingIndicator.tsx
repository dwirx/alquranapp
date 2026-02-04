import { Loader2, Brain, Search, Sparkles, CheckCircle2, XCircle } from "lucide-react";

interface ThinkingIndicatorProps {
  thinking?: string;
  status: "searching" | "thinking" | "generating" | "error" | "idle";
  errorMessage?: string;
}

const statusConfig = {
  searching: {
    icon: Search,
    text: "Mencari ayat relevan...",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  thinking: {
    icon: Brain,
    text: "AI sedang berpikir...",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  generating: {
    icon: Sparkles,
    text: "Menulis jawaban...",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  error: {
    icon: XCircle,
    text: "Terjadi kesalahan",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  idle: {
    icon: CheckCircle2,
    text: "Selesai",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
};

const ThinkingIndicator = ({ thinking, status, errorMessage }: ThinkingIndicatorProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
        {status === "idle" || status === "error" ? (
          <Icon className={`h-5 w-5 ${config.color}`} />
        ) : (
          <Icon className={`h-5 w-5 ${config.color} animate-pulse`} />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          {status !== "idle" && status !== "error" && (
            <Loader2 className={`h-4 w-4 animate-spin ${config.color}`} />
          )}
          <span className={`text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
        </div>

        {status === "error" && errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        {thinking && status === "thinking" && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground font-medium mb-1">Proses berpikir:</p>
            <p className="text-xs text-muted-foreground italic whitespace-pre-wrap line-clamp-4">
              {thinking}
            </p>
          </div>
        )}

        {(status === "searching" || status === "thinking") && !thinking && (
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ThinkingIndicator;
