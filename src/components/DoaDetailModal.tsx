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
import { Book, Languages, FileText } from "lucide-react";

interface DoaDetailModalProps {
  doa: Doa | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DoaDetailModal = ({ doa, open, onOpenChange }: DoaDetailModalProps) => {
  if (!doa) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{doa.nama}</DialogTitle>
          <DialogDescription className="sr-only">
            Detail lengkap doa {doa.nama} dengan teks Arab, transliterasi, dan terjemahan
          </DialogDescription>
          {doa.tag && doa.tag.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {doa.tag.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Arabic Text */}
            <div className="p-4 sm:p-6 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Book className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Teks Arab
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-arabic leading-loose text-right text-foreground">
                {doa.ar}
              </p>
            </div>

            {/* Latin Transliteration */}
            <div className="p-4 sm:p-6 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Languages className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Transliterasi Latin
                </span>
              </div>
              <p className="text-sm sm:text-base italic text-foreground leading-relaxed">
                {doa.tr}
              </p>
            </div>

            {/* Indonesian Translation */}
            <div className="p-4 sm:p-6 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Terjemahan
                </span>
              </div>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {doa.idn}
              </p>
            </div>

            {/* Additional Info */}
            {(doa.grup || doa.tentang) && (
              <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-2">
                {doa.grup && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Kategori:</span>
                    <Badge variant="outline">{doa.grup}</Badge>
                  </div>
                )}
                {doa.tentang && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Referensi:</span>
                    <p className="text-sm text-foreground">{doa.tentang}</p>
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
