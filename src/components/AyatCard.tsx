import { useState } from "react";
import { Play, Pause, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ayat, QariId } from "@/types/quran";

interface AyatCardProps {
  ayat: Ayat;
  onPlayAudio: (ayat: Ayat) => void;
  isPlaying: boolean;
  onShowTafsir: (ayatNumber: number) => void;
}

export function AyatCard({ ayat, onPlayAudio, isPlaying, onShowTafsir }: AyatCardProps) {
  return (
    <div className="group rounded-xl bg-card border border-border p-4 md:p-6 transition-all hover:shadow-card animate-fade-in">
      {/* Header with Ayat Number and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="ayat-number">
          {ayat.nomorAyat}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPlayAudio(ayat)}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShowTafsir(ayat.nomorAyat)}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="mb-6 text-right">
        <p className="arabic-text-lg leading-loose">
          {ayat.teksArab}
        </p>
      </div>

      {/* Latin Transliteration */}
      <p className="mb-3 text-muted-foreground italic">
        {ayat.teksLatin}
      </p>

      {/* Indonesian Translation */}
      <p className="text-foreground leading-relaxed">
        {ayat.teksIndonesia}
      </p>
    </div>
  );
}
