import { Doa } from "@/types/doa";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DoaCardProps {
  doa: Doa;
  onClick: () => void;
}

export const DoaCard = ({ doa, onClick }: DoaCardProps) => {
  return (
    <Card
      className="p-4 sm:p-5 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Title and Tags */}
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            {doa.nama}
          </h3>
          {doa.tag && doa.tag.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {doa.tag.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Arabic Text */}
        <div className="text-right">
          <p className="text-xl sm:text-2xl font-arabic leading-loose text-foreground">
            {doa.ar}
          </p>
        </div>

        {/* Latin Transliteration - Preview */}
        <div className="border-t pt-3">
          <p className="text-sm text-muted-foreground italic line-clamp-2">
            {doa.tr}
          </p>
        </div>

        {/* Group Badge */}
        {doa.grup && (
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge variant="outline" className="text-xs">
              📖 {doa.grup}
            </Badge>
            <span className="text-xs text-muted-foreground">Tap untuk detail</span>
          </div>
        )}
      </div>
    </Card>
  );
};
