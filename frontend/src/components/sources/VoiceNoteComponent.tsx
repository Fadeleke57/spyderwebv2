import { Source } from "@/types/source";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Card, CardContent } from "../ui/card";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

export const VoiceNoteComponent: React.FC<{ source: Source | null }> = ({
  source,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Handle audio loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      console.log("audio duration", audio.duration);
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      } else {
        setDuration(0); // Set a default value if duration is not available
      }
    };

    console.log("Audio Metadata:", {
      duration: audio.duration,
      readyState: audio.readyState,
      networkState: audio.networkState,
      src: audio.src,
      currentTime: audio.currentTime,
      paused: audio.paused,
      defaultPlaybackRate: audio.defaultPlaybackRate,
      playbackRate: audio.playbackRate,
      autoplay: audio.autoplay,
      ended: audio.ended,
      loop: audio.loop,
      volume: audio.volume,
      muted: audio.muted,
    });

    const handleDurationChange = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("loadedmetadata", handleDurationChange);

    // Force a load to try to get duration
    if (audio.readyState >= 2) {
      handleCanPlay();
    } else {
      audio.load();
    }

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("loadedmetadata", handleDurationChange);
    };
  }, [source?.url]);

  // Set up a more frequent progress updater than timeupdate event
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (audioRef.current && isFinite(audioRef.current.currentTime)) {
          setProgress(audioRef.current.currentTime);
        }
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Failed to play audio:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleProgressChange = (newValue: number[]) => {
    const newTime = newValue[0];

    // Validate to ensure we have a finite number
    if (
      isFinite(newTime) &&
      newTime >= 0 &&
      audioRef.current &&
      newTime <= (audioRef.current.duration || 0)
    ) {
      setProgress(newTime);
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newValue: number[]) => {
    const newVolume = newValue[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (!isFinite(timeInSeconds)) {
      return "0:00";
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Card className="w-full min-h-[79.5dvh]">
      <CardContent className="p-4 h-full">
        {source?.url && (
          <audio
            ref={audioRef}
            src={source?.url || ""}
            onEnded={handleEnded}
            preload="metadata"
          />
        )}

        <div className="flex flex-col lg:flex-row items-center gap-2 p-4 rounded-lg w-full h-full">
          <Button
            onClick={togglePlayPause}
            disabled={!isLoaded}
            size="icon"
            className="flex items-center justify-center rounded-full h-8 w-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-violet-500" size={16} />
            ) : (
              <Play className="w-4 h-4 text-violet-500" size={16} />
            )}
          </Button>

          <div className="flex flex-1 flex-col">
            <div className="mb-1 text-sm font-medium">
              {source?.name || "Voice Note"}
            </div>

            <div className="flex w-full gap-2 -ml-[6px]">
              <div className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(progress)}
              </div>

              <Slider
                value={[progress]}
                min={0}
                max={duration || 100}
                step={0.1}
                disabled={!isLoaded}
                onValueChange={handleProgressChange}
              />

              <div className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted rounded-lg pr-2">
            <Button
              onClick={toggleMute}
              size="icon"
              variant="ghost"
              className="rounded-full hover:bg-primary/10"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>

        {source?.content && (
          <ScrollArea
            className={cn(
              "mt-4 p-3 text-sm rounded-md bg-muted/50",
              "h-[63dvh]"
            )}
          >
            <span className="font-semibold text-violet-400">Transcript: </span>
            <br /> <br />
            <span>&ldquo;{source?.content}&rdquo;</span>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
