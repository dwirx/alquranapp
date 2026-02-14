import { Play, Pause, BookOpen, Volume2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ayat } from "@/types/quran";
import { cn } from "@/lib/utils";

interface AyatCardProps {
  ayat: Ayat;
  surahNumber?: number;
  surahName?: string;
  surahNameArabic?: string;
  onPlayAudio: (ayat: Ayat) => void;
  isPlaying: boolean;
  onShowTafsir: (ayatNumber: number) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  showLatin?: boolean;
  showTranslation?: boolean;
  fontSize?: "small" | "medium" | "large";
}

const fontSizeClasses = {
  small: "text-xl sm:text-2xl",
  medium: "text-2xl sm:text-3xl",
  large: "text-3xl sm:text-4xl",
};

export function AyatCard({ 
  ayat, 
  onPlayAudio, 
  isPlaying, 
  onShowTafsir,
  isBookmarked = false,
  onToggleBookmark,
  showLatin = true,
  showTranslation = true,
  fontSize = "medium",
}: AyatCardProps) {
  return (
    <div 
      id={`ayat-${ayat.nomorAyat}`}
      className={cn(
        "group rounded-xl bg-card border border-border p-3.5 sm:p-5 md:p-6 transition-all hover:shadow-card hover:border-quran-gold/30 animate-fade-in",
        isPlaying && "ring-1 ring-primary/30 border-primary/40 shadow-card"
      )}
    >
      {/* Header with Ayat Number and Actions */}
      <div className="flex items-start justify-between mb-3 sm:mb-5">
        <div className="ayat-number">
          {ayat.nomorAyat}
        </div>
        <div className="flex items-center gap-1">
          {onToggleBookmark && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleBookmark}
              className={cn(
                "h-9 w-9 sm:h-10 sm:w-10 rounded-lg",
                isBookmarked 
                  ? "text-quran-gold hover:text-quran-gold/80 hover:bg-quran-gold/10" 
                  : "hover:bg-primary/10 hover:text-primary"
              )}
              title={isBookmarked ? "Hapus Bookmark" : "Tambah Bookmark"}
            >
              <Bookmark className={cn("h-4 w-4 sm:h-5 sm:w-5", isBookmarked && "fill-current")} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPlayAudio(ayat)}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-primary/10 hover:text-primary"
            title="Putar Audio"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShowTafsir(ayat.nomorAyat)}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-primary/10 hover:text-primary"
            title="Lihat Tafsir"
          >
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="mb-4 sm:mb-6 text-right py-2.5 sm:py-4 px-2.5 sm:px-4 rounded-lg bg-muted/30">
        <p className={cn(
          "font-arabic leading-[1.95] sm:leading-loose text-foreground",
          fontSizeClasses[fontSize]
        )}>
          {ayat.teksArab}
        </p>
      </div>

      {/* Latin Transliteration */}
      {showLatin && (
        <p className="mb-3 text-sm sm:text-base text-muted-foreground italic leading-relaxed">
          {ayat.teksLatin}
        </p>
      )}

      {/* Indonesian Translation */}
      {showTranslation && (
        <p className="text-sm sm:text-base text-foreground leading-relaxed">
          {ayat.teksIndonesia}
        </p>
      )}

      {/* Playing indicator */}
      {isPlaying && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-primary text-sm">
          <Volume2 className="h-4 w-4 animate-pulse" />
          <span>Sedang diputar...</span>
        </div>
      )}
    </div>
  );
}
