import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";

export interface ReadingHistoryItem {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayatNumber?: number;
  timestamp: number;
}

const MAX_HISTORY_ITEMS = 10;

export function useReadingHistory() {
  const [history, setHistory] = useLocalStorage<ReadingHistoryItem[]>("quran-reading-history", []);

  const addToHistory = useCallback((item: Omit<ReadingHistoryItem, "timestamp">) => {
    setHistory((prev) => {
      // Remove existing entry for this surah if exists
      const filtered = prev.filter((h) => h.surahNumber !== item.surahNumber);
      
      // Add to front with timestamp
      const newHistory = [{ ...item, timestamp: Date.now() }, ...filtered];
      
      // Keep only max items
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    history,
    addToHistory,
    clearHistory,
  };
}
