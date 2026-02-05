import { Link } from "react-router-dom";
import { Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchDoaList } from "@/services/doaApi";
import { Doa } from "@/types/doa";
import { cn } from "@/lib/utils";

interface DoaCardProps {
  query: string;
  className?: string;
}

const DoaCard = ({ query, className }: DoaCardProps) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const { data: doaList, isLoading, error } = useQuery({
    queryKey: ["doa-list"],
    queryFn: () => fetchDoaList(),
    staleTime: Infinity, // Doa data never changes
  });

  // Search for matching doa
  const findMatchingDoa = (): Doa | null => {
    if (!doaList?.data) return null;

    const searchTerms = query.toLowerCase().split(/\s+/);

    // Score each doa based on how many search terms match
    const scored = doaList.data.map((doa) => {
      const namaLower = doa.nama.toLowerCase();
      const tagString = (doa.tag || []).join(" ").toLowerCase();
      const tentangLower = (doa.tentang || "").toLowerCase();

      let score = 0;
      for (const term of searchTerms) {
        if (namaLower.includes(term)) score += 3;
        if (tagString.includes(term)) score += 2;
        if (tentangLower.includes(term)) score += 1;
      }

      return { doa, score };
    });

    // Get best match
    const best = scored.sort((a, b) => b.score - a.score)[0];
    return best?.score > 0 ? best.doa : null;
  };

  const matchedDoa = findMatchingDoa();

  const handleCopy = async () => {
    if (!matchedDoa) return;

    try {
      const textToCopy = `${matchedDoa.ar}\n\n${matchedDoa.tr}\n\n${matchedDoa.idn}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Doa berhasil disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin doa");
    }
  };

  if (isLoading) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-amber-500 bg-amber-500/5 p-4", className)}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          <span className="text-sm text-muted-foreground">Mencari doa "{query}"...</span>
        </div>
      </div>
    );
  }

  if (error || !matchedDoa) {
    return (
      <div className={cn("my-3 rounded-xl border-l-4 border-amber-500 bg-amber-500/5 p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤲</span>
            <span className="text-sm text-muted-foreground">
              Doa "{query}" tidak ditemukan
            </span>
          </div>
          <Link to="/doa">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Lihat Semua Doa
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("my-3 rounded-xl border-l-4 border-amber-500 bg-amber-500/5 overflow-hidden", className)}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-amber-500/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🤲</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {matchedDoa.nama}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 space-y-4">
          {/* Arabic */}
          <p className="font-arabic text-2xl leading-loose text-right text-foreground">
            {matchedDoa.ar}
          </p>

          {/* Latin */}
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            {matchedDoa.tr}
          </p>

          {/* Translation */}
          <p className="text-sm text-foreground/90 leading-relaxed bg-amber-500/10 p-3 rounded-lg">
            <span className="font-medium">Artinya: </span>
            {matchedDoa.idn}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
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
            <Link to="/doa">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Lihat Doa Lainnya
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoaCard;
