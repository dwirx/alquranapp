import { useState } from "react";
import { Check, ChevronDown, Loader2, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useModels, ModelFilter } from "@/hooks/useModels";
import { AIModel } from "@/lib/chatDB";
import { formatPrice } from "@/services/openRouterApi";

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModelId,
  onSelectModel,
  disabled,
}: ModelSelectorProps) {
  const { models, allModels, isLoading, filter, setFilter, getModel } = useModels();
  const [isOpen, setIsOpen] = useState(false);

  const selectedModel = getModel(selectedModelId);
  const displayName = selectedModel?.name || selectedModelId.split("/").pop() || "Pilih Model";

  const handleSelect = (model: AIModel) => {
    onSelectModel(model.id);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isLoading}
          className="gap-2 min-w-[140px] justify-between"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {selectedModel?.isFree ? (
                <Zap className="h-4 w-4 text-green-500" />
              ) : (
                <Sparkles className="h-4 w-4 text-blue-500" />
              )}
              <span className="truncate max-w-[100px]">{displayName}</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[280px]">
        {/* Filter Tabs */}
        <div className="p-2 border-b">
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as ModelFilter)}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                Semua ({allModels.length})
              </TabsTrigger>
              <TabsTrigger value="free" className="text-xs">
                Gratis ({allModels.filter((m) => m.isFree).length})
              </TabsTrigger>
              <TabsTrigger value="paid" className="text-xs">
                Berbayar ({allModels.filter((m) => !m.isFree).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Model List */}
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Tidak ada model ditemukan
            </div>
          ) : (
            models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => handleSelect(model)}
                className={cn(
                  "flex items-center justify-between gap-2 cursor-pointer",
                  selectedModelId === model.id && "bg-accent"
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {model.isFree ? (
                    <Zap className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                  <span className="truncate">{model.name}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      model.isFree
                        ? "bg-green-500/10 text-green-600"
                        : "bg-blue-500/10 text-blue-600"
                    )}
                  >
                    {formatPrice(model.pricing.prompt)}
                  </span>
                  {selectedModelId === model.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
