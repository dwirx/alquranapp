import { Play, Pause, BookOpen, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ayat } from "@/types/quran";

interface AyatCardProps {
  ayat: Ayat;
  onPlayAudio: (ayat: Ayat) => void;
  isPlaying: boolean;
  onShowTafsir: (ayatNumber: number) => void;
}

export function AyatCard({ ayat, onPlayAudio, isPlaying, onShowTafsir }: AyatCardProps) {
  return (
    <div className="group rounded-xl bg-card border border-border p-4 sm:p-5 md:p-6 transition-all hover:shadow-card hover:border-quran-gold/30 animate-fade-in">
      {/* Header with Ayat Number and Actions */}
      <div className="flex items-start justify-between mb-4 sm:mb-5">
        <div className="ayat-number">
          {ayat.nomorAyat}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPlayAudio(ayat)}
            className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/10 hover:text-primary touch-target"
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
            className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/10 hover:text-primary touch-target"
            title="Lihat Tafsir"
          >
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="mb-5 sm:mb-6 text-right py-2 sm:py-4 px-2 sm:px-4 rounded-lg bg-muted/30">
        <p className="arabic-text-lg leading-loose">
          {ayat.teksArab}
        </p>
      </div>

      {/* Latin Transliteration */}
      <p className="mb-3 text-sm sm:text-base text-muted-foreground italic leading-relaxed">
        {ayat.teksLatin}
      </p>

      {/* Indonesian Translation */}
      <p className="text-sm sm:text-base text-foreground leading-relaxed">
        {ayat.teksIndonesia}
      </p>

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
