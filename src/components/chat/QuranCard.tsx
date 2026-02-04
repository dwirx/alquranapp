import { Link } from "react-router-dom";
import { BookOpen, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface QuranCardProps {
  surah: number;
  ayat: string;
  arabic: string;
  surahName?: string;
}

const QuranCard = ({ surah, ayat, arabic, surahName }: QuranCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(arabic);
      setCopied(true);
      toast.success("Teks Arab berhasil disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin teks");
    }
  };

  const surahNames: Record<number, string> = {
    1: "Al-Fatihah", 2: "Al-Baqarah", 3: "Ali 'Imran", 4: "An-Nisa'",
    5: "Al-Ma'idah", 6: "Al-An'am", 7: "Al-A'raf", 8: "Al-Anfal",
    9: "At-Taubah", 10: "Yunus", 11: "Hud", 12: "Yusuf",
    13: "Ar-Ra'd", 14: "Ibrahim", 15: "Al-Hijr", 16: "An-Nahl",
    17: "Al-Isra'", 18: "Al-Kahf", 19: "Maryam", 20: "Ta-Ha",
    21: "Al-Anbiya'", 22: "Al-Hajj", 23: "Al-Mu'minun", 24: "An-Nur",
    25: "Al-Furqan", 26: "Asy-Syu'ara'", 27: "An-Naml", 28: "Al-Qasas",
    29: "Al-'Ankabut", 30: "Ar-Rum", 31: "Luqman", 32: "As-Sajdah",
    33: "Al-Ahzab", 34: "Saba'", 35: "Fatir", 36: "Ya-Sin",
    37: "As-Saffat", 38: "Sad", 39: "Az-Zumar", 40: "Gafir",
    41: "Fussilat", 42: "Asy-Syura", 43: "Az-Zukhruf", 44: "Ad-Dukhan",
    45: "Al-Jasiyah", 46: "Al-Ahqaf", 47: "Muhammad", 48: "Al-Fath",
    49: "Al-Hujurat", 50: "Qaf", 51: "Az-Zariyat", 52: "At-Tur",
    53: "An-Najm", 54: "Al-Qamar", 55: "Ar-Rahman", 56: "Al-Waqi'ah",
    57: "Al-Hadid", 58: "Al-Mujadalah", 59: "Al-Hasyr", 60: "Al-Mumtahanah",
    61: "As-Saff", 62: "Al-Jumu'ah", 63: "Al-Munafiqun", 64: "At-Tagabun",
    65: "At-Talaq", 66: "At-Tahrim", 67: "Al-Mulk", 68: "Al-Qalam",
    69: "Al-Haqqah", 70: "Al-Ma'arij", 71: "Nuh", 72: "Al-Jinn",
    73: "Al-Muzzammil", 74: "Al-Muddassir", 75: "Al-Qiyamah", 76: "Al-Insan",
    77: "Al-Mursalat", 78: "An-Naba'", 79: "An-Nazi'at", 80: "'Abasa",
    81: "At-Takwir", 82: "Al-Infitar", 83: "Al-Mutaffifin", 84: "Al-Insyiqaq",
    85: "Al-Buruj", 86: "At-Tariq", 87: "Al-A'la", 88: "Al-Gasyiyah",
    89: "Al-Fajr", 90: "Al-Balad", 91: "Asy-Syams", 92: "Al-Lail",
    93: "Ad-Duha", 94: "Asy-Syarh", 95: "At-Tin", 96: "Al-'Alaq",
    97: "Al-Qadr", 98: "Al-Bayyinah", 99: "Az-Zalzalah", 100: "Al-'Adiyat",
    101: "Al-Qari'ah", 102: "At-Takasur", 103: "Al-'Asr", 104: "Al-Humazah",
    105: "Al-Fil", 106: "Quraisy", 107: "Al-Ma'un", 108: "Al-Kausar",
    109: "Al-Kafirun", 110: "An-Nasr", 111: "Al-Lahab", 112: "Al-Ikhlas",
    113: "Al-Falaq", 114: "An-Nas",
  };

  const displayName = surahName || surahNames[surah] || `Surah ${surah}`;
  const firstAyat = ayat.includes("-") ? ayat.split("-")[0] : ayat;

  return (
    <div className="my-3 rounded-xl border-l-4 border-primary bg-primary/5 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-semibold text-primary">
            {displayName}: {ayat}
          </span>
        </div>
      </div>

      {/* Arabic Text */}
      <p className="font-arabic text-2xl leading-loose text-right text-foreground">
        {arabic}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <Link to={`/surah/${surah}#ayat-${firstAyat}`}>
          <Button variant="default" size="sm" className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Buka Surah
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Tersalin" : "Salin"}
        </Button>
      </div>
    </div>
  );
};

export default QuranCard;
