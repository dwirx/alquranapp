import { ImsakiyahDay } from "@/types/imsakiyah";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef } from "react";

interface ImsakiyahTableProps {
  schedule: ImsakiyahDay[];
  currentDay: number;
}

export const ImsakiyahTable = ({ schedule, currentDay }: ImsakiyahTableProps) => {
  const currentRowRef = useRef<HTMLTableRowElement>(null);

  // Auto-scroll to current day on mount
  useEffect(() => {
    if (currentRowRef.current) {
      currentRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentDay]);

  return (
    <div className="rounded-xl border-2 border-border overflow-hidden shadow-lg bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-card/95 backdrop-blur sticky top-0 z-10">
            <TableRow className="border-b-2 border-border hover:bg-transparent">
              <TableHead className="font-bold text-foreground sticky left-0 bg-card/95 backdrop-blur z-10 w-20 sm:w-24">
                Tgl
              </TableHead>
              <TableHead className="font-bold text-foreground min-w-[80px] sm:min-w-[100px]">
                <span className="hidden sm:inline">Imsak</span>
                <span className="sm:hidden">Ims</span>
              </TableHead>
              <TableHead className="font-bold text-foreground min-w-[80px] sm:min-w-[100px]">
                <span className="hidden sm:inline">Subuh</span>
                <span className="sm:hidden">Sub</span>
              </TableHead>
              <TableHead className="font-bold text-foreground min-w-[80px] sm:min-w-[100px]">
                <span className="hidden sm:inline">Terbit</span>
                <span className="sm:hidden">Ter</span>
              </TableHead>
              <TableHead className="font-bold text-foreground min-w-[80px] sm:min-w-[100px]">
                <span className="hidden sm:inline">Dhuha</span>
                <span className="sm:hidden">Dhu</span>
              </TableHead>
              <TableHead className="font-bold text-foreground min-w-[80px] sm:min-w-[100px]">
                <span className="hidden sm:inline">Dzuhur</span>
                <span className="sm:hidden">Dzu</span>
              </TableHead>
              <TableHead className="font-bold text-foreground min-w-[80px] sm:min-w-[100px]">
                <span className="hidden sm:inline">Ashar</span>
                <span className="sm:hidden">Ash</span>
              </TableHead>
              <TableHead className="font-bold text-foreground min-w-[80px] sm:min-w-[100px]">
                <span className="hidden sm:inline">Maghrib</span>
                <span className="sm:hidden">Mag</span>
              </TableHead>
              <TableHead className="font-bold text-foreground min-w-[80px] sm:min-w-[100px]">
                Isya
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map((day) => {
              const isToday = day.tanggal === currentDay;
              return (
                <TableRow
                  key={day.tanggal}
                  ref={isToday ? currentRowRef : null}
                  className={`${
                    isToday
                      ? "bg-primary/10 border-l-4 border-l-primary font-semibold"
                      : "even:bg-muted/30"
                  } hover:bg-primary/5 transition-colors`}
                >
                  <TableCell className="sticky left-0 bg-inherit font-bold text-foreground border-r border-border">
                    {day.tanggal}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-primary font-semibold">
                    {day.imsak}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-primary font-semibold">
                    {day.subuh}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{day.terbit}</TableCell>
                  <TableCell className="font-mono tabular-nums">{day.dhuha}</TableCell>
                  <TableCell className="font-mono tabular-nums">{day.dzuhur}</TableCell>
                  <TableCell className="font-mono tabular-nums">{day.ashar}</TableCell>
                  <TableCell className="font-mono tabular-nums">{day.maghrib}</TableCell>
                  <TableCell className="font-mono tabular-nums">{day.isya}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Scroll Hint for Mobile */}
      <div className="sm:hidden p-3 bg-muted/50 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          ← Geser untuk melihat semua waktu shalat →
        </p>
      </div>
    </div>
  );
};
