import { Doa } from "@/types/doa";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface DoaCardProps {
  doa: Doa;
  onClick: () => void;
}

export const DoaCard = ({ doa, onClick }: DoaCardProps) => {
  return (
    <Card
      className="group p-5 sm:p-6 lg:p-8 cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 hover:scale-[1.02] transition-all duration-300 ease-in-out"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Title and Tags */}
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight flex-1">
              {doa.nama}
            </h3>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-1" />
          </div>
          {doa.tag && doa.tag.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {doa.tag.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs font-medium">
                  {tag}
                </Badge>
              ))}
              {doa.tag.length > 3 && (
                <Badge variant="secondary" className="text-xs font-medium">
                  +{doa.tag.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Arabic Text */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-arabic leading-[2.2] text-right text-foreground line-clamp-2 sm:line-clamp-3">
            {doa.ar}
          </p>
        </div>

        {/* Latin Transliteration - Preview */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-sm sm:text-base text-muted-foreground italic line-clamp-2 leading-relaxed">
            {doa.tr}
          </p>
        </div>

        {/* Group Badge */}
        {doa.grup && (
          <div className="flex items-center justify-between pt-2">
            <Badge variant="outline" className="text-xs font-medium">
              📖 {doa.grup}
            </Badge>
            <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Lihat detail →
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
