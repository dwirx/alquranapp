import { useState, useEffect, useCallback, useMemo } from "react";
import { AIModel, getAllModels, saveModels, getSetting, setSetting } from "@/lib/chatDB";
import { fetchModels, FALLBACK_MODELS } from "@/services/openRouterApi";
import { filterFreeOrZeroPriceModels } from "@/hooks/modelFilters";
import { ChatApiConfig } from "@/types/chat";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export type ModelSort = "newest" | "oldest" | "name-asc" | "name-desc" | "price-asc" | "price-desc" | "context-desc";

function formatCustomModelName(modelId: string): string {
  return modelId
    .replace(/^openrouter\//i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function useModels(config?: ChatApiConfig, customModelIds: string[] = []) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<ModelSort>("newest");

  // Fetch and cache models
  const loadModels = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      if (!forceRefresh) {
        const cacheTime = await getSetting<number>("modelsCacheTime");
        const cachedModels = await getAllModels();

        if (cacheTime && Date.now() - cacheTime < CACHE_DURATION && cachedModels.length > 0) {
          console.log("[Models] Using cached models:", cachedModels.length);
          setModels(cachedModels);
          setIsLoading(false);
          return;
        }
      }

      // Fetch fresh models
      console.log("[Models] Fetching from API...");
      const freshModels = await fetchModels(config);

      // Save to cache
      await saveModels(freshModels);
      await setSetting("modelsCacheTime", Date.now());

      setModels(freshModels);
    } catch (err) {
      console.error("[Models] Failed to load:", err);
      setError("Gagal memuat daftar model");

      // Use fallback
      setModels(FALLBACK_MODELS);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Load on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Filter and sort models
  const processedModels = useMemo(() => {
    let result = filterFreeOrZeroPriceModels(models);

    // Then sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "newest":
          // Newest first (higher created timestamp = newer)
          return (b.created || 0) - (a.created || 0);
        case "oldest":
          // Oldest first (lower created timestamp = older)
          return (a.created || 0) - (b.created || 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          // Free first, then by price
          if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
          return a.pricing.prompt - b.pricing.prompt;
        case "price-desc":
          // Expensive first
          if (a.isFree !== b.isFree) return a.isFree ? 1 : -1;
          return b.pricing.prompt - a.pricing.prompt;
        case "context-desc":
          return b.context_length - a.context_length;
        default:
          return 0;
      }
    });

    const existingIds = new Set(result.map((model) => model.id));
    const customModels: AIModel[] = customModelIds
      .filter((modelId) => modelId && !existingIds.has(modelId))
      .map((modelId) => ({
        id: modelId,
        name: formatCustomModelName(modelId),
        description: "Model custom dari pengaturan",
        pricing: { prompt: 0, completion: 0 },
        context_length: 128000,
        isFree: true,
        created: Date.now(),
      }));

    return [...customModels, ...result];
  }, [customModelIds, models, sort]);

  // Get model by ID
  const getModel = useCallback(
    (modelId: string): AIModel | undefined => {
      return models.find((m) => m.id === modelId);
    },
    [models]
  );

  // Refresh models
  const refreshModels = useCallback(() => {
    return loadModels(true);
  }, [loadModels]);

  return {
    models: processedModels,
    allModels: models,
    isLoading,
    error,
    sort,
    setSort,
    getModel,
    refreshModels,
  };
}
