import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QARI_LIST, QariId, Ayat } from "@/types/quran";

interface AudioPlayerProps {
  ayat: Ayat;
  surahName?: string;
  autoPlay?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onClose?: () => void;
}

export function AudioPlayer({ 
  ayat, 
  surahName,
  autoPlay = false,
  onNext, 
  onPrevious, 
  hasNext = false, 
  hasPrevious = false,
  onClose
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedQari, setSelectedQari] = useState<QariId>("05");
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const audioUrl = ayat.audio[selectedQari];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (hasNext && onNext) {
        onNext();
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [hasNext, onNext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    setIsLoading(true);

    if (!autoPlay) return;

    const startPlayback = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.warn("[AudioPlayer] Autoplay blocked:", error);
        setIsPlaying(false);
      }
    };

    void startPlayback();
  }, [ayat.nomorAyat, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* Header - Ayat info and close button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-primary-foreground/90 truncate">
              {surahName && <span className="font-medium">{surahName} • </span>}
              Ayat {ayat.nomorAyat}
            </p>
          </div>
          
          {/* Qari Selector - Hidden on mobile, shown on larger screens */}
          <div className="hidden sm:block">
            <Select value={selectedQari} onValueChange={(v) => setSelectedQari(v as QariId)}>
              <SelectTrigger className="w-44 h-8 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[80]">
                {QARI_LIST.map((qari) => (
                  <SelectItem key={qari.id} value={qari.id} className="text-sm">
                    {qari.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile Qari Selector */}
        <div className="sm:hidden">
          <Select value={selectedQari} onValueChange={(v) => setSelectedQari(v as QariId)}>
            <SelectTrigger className="w-full h-9 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top" sideOffset={8} className="z-[80] max-h-64">
              {QARI_LIST.map((qari) => (
                <SelectItem key={qari.id} value={qari.id} className="text-sm">
                  {qari.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-primary-foreground/70 w-9 sm:w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-primary-foreground/70 w-9 sm:w-10 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="h-9 w-9 sm:h-10 sm:w-10 text-primary-foreground hover:bg-primary-foreground/20 disabled:opacity-30 touch-target"
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={isLoading}
              className="h-11 w-11 sm:h-12 sm:w-12 text-primary-foreground hover:bg-primary-foreground/20 touch-target"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={!hasNext}
              className="h-9 w-9 sm:h-10 sm:w-10 text-primary-foreground hover:bg-primary-foreground/20 disabled:opacity-30 touch-target"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Volume controls - hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={(v) => setVolume(v[0])}
              className="w-20"
            />
          </div>

          {/* Mobile volume toggle only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="sm:hidden h-9 w-9 text-primary-foreground hover:bg-primary-foreground/20 touch-target"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
