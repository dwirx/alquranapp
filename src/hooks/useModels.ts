import { useState, useEffect, useCallback, useMemo } from "react";
import { AIModel, getAllModels, saveModels, getSetting, setSetting } from "@/lib/chatDB";
import { fetchModels, FALLBACK_MODELS } from "@/services/openRouterApi";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export type ModelFilter = "all" | "free" | "paid";
export type ModelSort = "newest" | "oldest" | "name-asc" | "name-desc" | "price-asc" | "price-desc" | "context-desc";

export function useModels() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ModelFilter>("all");
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
      const freshModels = await fetchModels();

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
  }, []);

  // Load on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Filter and sort models
  const processedModels = useMemo(() => {
    // First filter
    let result = models.filter((model) => {
      if (filter === "free") return model.isFree;
      if (filter === "paid") return !model.isFree;
      return true;
    });

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

    return result;
  }, [models, filter, sort]);

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
    filter,
    setFilter,
    sort,
    setSort,
    getModel,
    refreshModels,
  };
}
