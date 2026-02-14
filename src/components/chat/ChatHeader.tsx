import { MessageSquareText } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import { ApiSettingsDialog } from "./ApiSettingsDialog";
import { ChatApiConfig } from "@/types/chat";

interface ChatHeaderProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  apiConfig: ChatApiConfig;
  customModels: string[];
  onApplySettings: (payload: {
    apiConfig: ChatApiConfig;
    customModels: string[];
    selectedModelId?: string;
  }) => Promise<void>;
  disabled?: boolean;
}

export function ChatHeader({
  selectedModelId,
  onSelectModel,
  apiConfig,
  customModels,
  onApplySettings,
  disabled,
}: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-30 w-full px-3 py-1.5 sm:px-4 h-10 flex items-center justify-end sm:justify-between border-b sm:border-b-border border-transparent bg-background/60 backdrop-blur-md transition-all">
      <div className="hidden sm:flex items-center gap-2 min-w-0">
        <div className="p-1 rounded-md bg-primary/10">
          <MessageSquareText className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-xs sm:text-sm leading-none">AI Chat</h1>
          <p className="text-[9px] text-muted-foreground hidden sm:block">Model AI Aktif</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ApiSettingsDialog
          apiConfig={apiConfig}
          selectedModelId={selectedModelId}
          customModels={customModels}
          onApply={onApplySettings}
          disabled={disabled}
        />
        <ModelSelector
          selectedModelId={selectedModelId}
          onSelectModel={onSelectModel}
          apiConfig={apiConfig}
          customModels={customModels}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
