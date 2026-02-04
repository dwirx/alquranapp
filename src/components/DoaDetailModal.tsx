import { Doa } from "@/types/doa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Languages, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DoaDetailModalProps {
  doa: Doa | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DoaDetailModal = ({ doa, open, onOpenChange }: DoaDetailModalProps) => {
  if (!doa) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full sm:h-auto sm:w-[90vw] sm:max-w-3xl lg:max-w-4xl sm:max-h-[90vh] p-0 gap-0 sm:rounded-2xl overflow-hidden">
        {/* Sticky Header */}
        <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-5 py-4 sm:px-6 sm:py-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight pr-8">
                {doa.nama}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detail lengkap doa {doa.nama} dengan teks Arab, transliterasi, dan terjemahan
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 sm:hidden"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {doa.tag && doa.tag.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {doa.tag.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="h-[calc(100vh-140px)] sm:h-auto sm:max-h-[calc(90vh-140px)]">
          <div className="px-5 py-6 sm:px-6 sm:py-8 space-y-6 sm:space-y-8">
            {/* Arabic Text */}
            <div className="group rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8 border-2 border-primary/20 shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
              <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <Book className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-primary">
                  Teks Arab
                </span>
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-arabic leading-[2.2] text-right text-foreground selection:bg-primary/20">
                {doa.ar}
              </p>
            </div>

            {/* Latin Transliteration */}
            <div className="group rounded-xl bg-gradient-to-br from-muted/50 to-background p-6 sm:p-8 border border-border shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors duration-300">
                  <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-foreground">
                  Transliterasi Latin
                </span>
              </div>
              <p className="text-base sm:text-lg lg:text-xl italic text-foreground/90 leading-relaxed selection:bg-muted">
                {doa.tr}
              </p>
            </div>

            {/* Indonesian Translation */}
            <div className="group rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-background p-6 sm:p-8 border-2 border-accent/20 shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-accent-foreground">
                  Terjemahan Indonesia
                </span>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-foreground leading-relaxed max-w-prose selection:bg-accent/20">
                {doa.idn}
              </p>
            </div>

            {/* Additional Info */}
            {(doa.grup || doa.tentang) && (
              <div className="rounded-xl bg-muted/30 border border-border p-5 sm:p-6 space-y-4">
                {doa.grup && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Kategori:</span>
                    <Badge variant="outline" className="font-medium">{doa.grup}</Badge>
                  </div>
                )}
                {doa.tentang && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Referensi:</span>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                      {doa.tentang}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
