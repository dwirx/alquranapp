import { useState } from "react";
import {
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
  Zap,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useModels, ModelSort } from "@/hooks/useModels";
import { AIModel } from "@/lib/chatDB";
import { formatPrice } from "@/services/openRouterApi";

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

const SORT_OPTIONS: { value: ModelSort; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "name-asc", label: "Nama A-Z" },
  { value: "name-desc", label: "Nama Z-A" },
  { value: "price-asc", label: "Termurah" },
  { value: "price-desc", label: "Termahal" },
  { value: "context-desc", label: "Context Terbesar" },
];

export function ModelSelector({
  selectedModelId,
  onSelectModel,
  disabled,
}: ModelSelectorProps) {
  const {
    models,
    isLoading,
    sort,
    setSort,
    getModel,
    refreshModels,
  } = useModels();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedModel = getModel(selectedModelId);
  const displayName =
    selectedModel?.name || selectedModelId.split("/").pop() || "Pilih Model";

  const handleSelect = (model: AIModel) => {
    onSelectModel(model.id);
    setIsOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshModels();
    setIsRefreshing(false);
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

      <DropdownMenuContent align="end" className="w-[320px]">
        <div className="p-2 border-b text-xs text-muted-foreground text-center">
          Menampilkan model gratis atau harga $0
        </div>

        {/* Sort & Refresh */}
        <div className="p-2 border-b flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select value={sort} onValueChange={(v) => setSort(v as ModelSort)}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
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
                  "flex items-center justify-between gap-2 cursor-pointer py-2",
                  selectedModelId === model.id && "bg-accent"
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {model.isFree ? (
                    <Zap className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm">{model.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(model.context_length / 1000).toFixed(0)}K context
                    </p>
                  </div>
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

        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-muted-foreground text-center">
          {models.length} model ditampilkan
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
