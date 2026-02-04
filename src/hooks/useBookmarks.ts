import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayatNumber: number;
  ayatText?: string;
  timestamp: number;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("quran-bookmarks", []);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "timestamp">) => {
    setBookmarks((prev) => {
      // Check if already bookmarked
      const exists = prev.some(
        (b) => b.surahNumber === bookmark.surahNumber && b.ayatNumber === bookmark.ayatNumber
      );
      if (exists) return prev;
      
      return [{ ...bookmark, timestamp: Date.now() }, ...prev];
    });
  }, [setBookmarks]);

  const removeBookmark = useCallback((surahNumber: number, ayatNumber: number) => {
    setBookmarks((prev) => 
      prev.filter((b) => !(b.surahNumber === surahNumber && b.ayatNumber === ayatNumber))
    );
  }, [setBookmarks]);

  const isBookmarked = useCallback((surahNumber: number, ayatNumber: number) => {
    return bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayatNumber === ayatNumber
    );
  }, [bookmarks]);

  const toggleBookmark = useCallback((bookmark: Omit<Bookmark, "timestamp">) => {
    if (isBookmarked(bookmark.surahNumber, bookmark.ayatNumber)) {
      removeBookmark(bookmark.surahNumber, bookmark.ayatNumber);
    } else {
      addBookmark(bookmark);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  };
}
