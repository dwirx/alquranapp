import { useState, useEffect, useCallback } from "react";
import { AIModel, getAllModels, saveModels, getSetting, setSetting } from "@/lib/chatDB";
import { fetchModels, FALLBACK_MODELS } from "@/services/openRouterApi";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export type ModelFilter = "all" | "free" | "paid";

export function useModels() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ModelFilter>("all");

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

  // Filter models
  const filteredModels = models.filter((model) => {
    if (filter === "free") return model.isFree;
    if (filter === "paid") return !model.isFree;
    return true;
  });

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
    models: filteredModels,
    allModels: models,
    isLoading,
    error,
    filter,
    setFilter,
    getModel,
    refreshModels,
  };
}
