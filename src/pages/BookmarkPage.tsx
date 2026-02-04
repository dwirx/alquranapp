import { Link } from "react-router-dom";
import { BookMarked, Trash2, BookOpen } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BookmarkPage = () => {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookMarked className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Bookmark</h1>
              <p className="text-xs text-muted-foreground">
                {bookmarks.length} ayat tersimpan
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-4 sm:py-6">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-2xl bg-muted/50 mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Belum ada bookmark
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Tandai ayat favorit Anda dengan menekan ikon bookmark saat membaca Al-Quran
            </p>
            <Link to="/">
              <Button>
                Mulai Membaca
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={`${bookmark.surahNumber}-${bookmark.ayatNumber}`}
                className="group rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/surah/${bookmark.surahNumber}#ayat-${bookmark.ayatNumber}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8",
                        "rounded-lg bg-primary/10 text-primary",
                        "text-sm font-bold"
                      )}>
                        {bookmark.surahNumber}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {bookmark.surahName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Ayat {bookmark.ayatNumber}
                        </p>
                      </div>
                      <p className="font-arabic text-xl text-quran-gold ml-auto">
                        {bookmark.surahNameArabic}
                      </p>
                    </div>
                    {bookmark.ayatText && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {bookmark.ayatText}
                      </p>
                    )}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBookmark(bookmark.surahNumber, bookmark.ayatNumber)}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Disimpan {new Date(bookmark.timestamp).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default BookmarkPage;
