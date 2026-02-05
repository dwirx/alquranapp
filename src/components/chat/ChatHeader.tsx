import { MessageSquareText } from "lucide-react";
import { ModelSelector } from "./ModelSelector";

interface ChatHeaderProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

export function ChatHeader({
  selectedModelId,
  onSelectModel,
  disabled,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <MessageSquareText className="h-5 w-5 text-primary" />
        <h1 className="font-semibold text-lg">AI Chat</h1>
      </div>

      <ModelSelector
        selectedModelId={selectedModelId}
        onSelectModel={onSelectModel}
        disabled={disabled}
      />
    </div>
  );
}
