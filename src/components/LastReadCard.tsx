import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface LastReadItem {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayatNumber?: number;
  timestamp?: number;
}

interface LastReadCardProps {
  item: LastReadItem;
}

export function LastReadCard({ item }: LastReadCardProps) {
  return (
    <Link
      to={`/surah/${item.surahNumber}${item.ayatNumber ? `#ayat-${item.ayatNumber}` : ''}`}
      className="flex-shrink-0 w-[140px] sm:w-[160px] p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-200 hover:shadow-md group"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <BookOpen className="h-3 w-3 text-primary" />
        </div>
        <span className="text-[10px] text-muted-foreground">Terakhir dibaca</span>
      </div>
      
      <p className="font-arabic text-lg text-quran-gold mb-1 leading-tight">
        {item.surahNameArabic}
      </p>
      
      <p className="text-sm font-semibold text-foreground truncate">
        {item.surahName}
      </p>
      
      {item.ayatNumber && (
        <p className="text-xs text-muted-foreground mt-0.5">
          Ayat {item.ayatNumber}
        </p>
      )}
    </Link>
  );
}

// Placeholder for when there's no last read
export function LastReadEmpty() {
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[160px] p-3 rounded-xl bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center text-center min-h-[100px]">
      <BookOpen className="h-5 w-5 text-muted-foreground mb-2" />
      <p className="text-xs text-muted-foreground">
        Belum ada riwayat bacaan
      </p>
    </div>
  );
}
