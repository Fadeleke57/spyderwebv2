import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { useSourceStore } from "@/store/sourceStore";
import { Button } from "../ui/button";
import { AudioLines, Download, Loader, Mic, X } from "lucide-react";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { useFetchSourcesForWeb, useUploadVoiceNote } from "@/hooks/sources";
import { useFetchWebById } from "@/hooks/webs";
import SimpleTooltip from "../utility/SimpleTooltip";

function VoiceRecordModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          className="border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60 p-1 rounded-full"
          size={"icon"}
        >
          <AudioLines size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent
        hideClose
        aria-describedby={undefined}
        className="max-w-[100dvw] max-h-[100dvh] w-full h-full flex flex-col items-center justify-center p-0 m-0 rounded-none border-none"
      >
        <DialogHeader className="absolute top-4 right-4 z-10">
          <Button
            className="rounded-full h-12 w-12"
            onClick={() => setOpen(false)}
          >
            <X size={16}></X>
          </Button>
        </DialogHeader>
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <UploadVoiceNote setOpen={setOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Audio visualization component
function AudioVisualization({
  isRecording,
  analyserRef,
}: {
  isRecording: boolean;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  // const [audioLevel, setAudioLevel] = useState(0); // Kept if used, though getAudioData handles normalization

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const numShapes = 3;
    const contoursPerShape = 25;
    const points = 100;
    let time = 0;
    let animationId: number | null = null;

    const visualizationScaleMultiplier = 2.0;

    if (isRecording && analyserRef.current && !dataArrayRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    } else if (!isRecording) {
      // Clear dataArrayRef when not recording so it's reinitialized if recording starts again
      dataArrayRef.current = null;
    }

    function getAudioData() {
      if (isRecording && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
        const average = sum / dataArrayRef.current.length;
        const normalized = average / 255;
        // setAudioLevel(normalized); // Uncomment if audioLevel state is needed elsewhere
        return normalized;
      }
      return 0; // Return 0 when not recording or if refs are null
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      time += 0.002; // Base time increment
      const audioIntensity = getAudioData(); // Will be 0 if not recording

      // --- Unified Visual Scale Calculation ---
      // This scale factor affects the overall size and dynamism of the shapes.
      // It aims to provide a continuous, noticeable animation in resting state,
      // and enhance with audio intensity when recording.
      const baseTimePulse = Math.sin(time * 0.85) * 0.2; // More pronounced time-based pulse
      let currentVisualScale;
      if (isRecording) {
        currentVisualScale = 1.1 + baseTimePulse + audioIntensity * 1.8;
      } else {
        // Resting state: more active than before
        currentVisualScale = 0.95 + baseTimePulse; // Was 0.8 + Math.sin(time * 0.5) * 0.1
      }

      const centerX = width / 2;
      const centerY = height / 2;

      for (let shapeIndex = 0; shapeIndex < numShapes; shapeIndex++) {
        const shapePhase = time + (shapeIndex * Math.PI * 2) / numShapes;
        const offsetX =
          Math.sin(shapePhase * 0.3) *
          30 *
          currentVisualScale * // Use new scale
          visualizationScaleMultiplier *
          0.5;
        const offsetY =
          Math.cos(shapePhase * 0.25) *
          30 *
          currentVisualScale * // Use new scale
          visualizationScaleMultiplier *
          0.5;

        for (let contour = 0; contour < contoursPerShape; contour++) {
          const baseContourRadius = 25 * visualizationScaleMultiplier;
          const perContourRadiusStep = 2.5 * visualizationScaleMultiplier;
          // Scale for each contour, driven by currentVisualScale
          const scale =
            (baseContourRadius + contour * perContourRadiusStep) *
            currentVisualScale;

          const contourOffsetX =
            Math.sin(contour * 0.15 + shapePhase) *
            8 *
            currentVisualScale * // Use new scale
            visualizationScaleMultiplier *
            0.5;
          const contourOffsetY =
            Math.cos(contour * 0.15 + shapePhase) *
            8 *
            currentVisualScale * // Use new scale
            visualizationScaleMultiplier *
            0.5;

          ctx.beginPath();

          // --- Unified Opacity and LineWidth ---
          const timeOpacityFactor = Math.sin(time * 0.7) * 0.05;
          const timeLineWidthFactor = Math.sin(time * 0.8) * 0.05;

          const finalOpacity = isRecording
            ? Math.max(0.1, 0.15 + audioIntensity * 0.5)
            : Math.max(0.1, 0.2 + timeOpacityFactor); // Resting: 0.20 +/- 0.05

          const finalLineWidth = isRecording
            ? Math.max(0.2, 0.5 + audioIntensity * 1.0)
            : Math.max(0.2, 0.35 + timeLineWidthFactor); // Resting: 0.35 +/- 0.05

          ctx.strokeStyle = `rgba(255, 255, 255, ${finalOpacity})`;
          ctx.lineWidth = finalLineWidth;

          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            let radius = scale;

            // --- Unified Radius Perturbation Logic ---
            // General undulation terms - these make it "move" consistently
            radius +=
              12 *
              visualizationScaleMultiplier *
              Math.sin(angle * 3 + shapePhase * 2) *
              currentVisualScale *
              0.85; // Slightly adjusted multiplier
            radius +=
              8 *
              visualizationScaleMultiplier *
              Math.cos(angle * 5 - shapePhase) *
              currentVisualScale *
              0.85;
            radius +=
              4 *
              visualizationScaleMultiplier *
              Math.sin(angle * 8 + contour * 0.1) *
              currentVisualScale *
              0.85;

            // Audio-specific reactivity OR a pronounced resting animation
            if (isRecording && audioIntensity > 0.01) {
              // Threshold to avoid reacting to tiny noise
              radius +=
                audioIntensity *
                25 * // Strength of audio reaction
                visualizationScaleMultiplier *
                Math.sin(angle * 2 + time * 4); // "Bumping" to audio
            } else if (!isRecording) {
              // Add a distinct, continuous morphing effect for the resting state
              // This ensures it's always visibly "alive" and moving with complexity.
              radius +=
                (Math.sin(angle * 2.5 + time * 1.7) * 0.6 + // Adjusted time multiplier for different feel
                  Math.cos(angle * 3.5 - time * 1.2) * 0.4) *
                visualizationScaleMultiplier *
                3.5 * // Amplitude of this resting morphing, slightly increased
                currentVisualScale *
                0.6; // Modulate by currentVisualScale, but keep it distinct
            }

            const x =
              centerX + offsetX + contourOffsetX + Math.cos(angle) * radius;
            const y =
              centerY + offsetY + contourOffsetY + Math.sin(angle) * radius;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isRecording, analyserRef]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={1000}
        height={800}
        className="max-w-[70vw] max-h-[100dvh] w-auto h-auto"
      />
    </div>
  );
}

function UploadVoiceNote({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { setSelectedSourceId, setIsWebDataModalOpen } = useSourceStore();
  const router = useRouter();
  const { webId } = router.query;
  const { mutateAsync: uploadVoiceNote, isPending: isVoiceNoteUploading } =
    useUploadVoiceNote(webId as string);
  const { refetch: refetchSources } = useFetchSourcesForWeb(webId as string);
  const { refetch: refetchWeb } = useFetchWebById(webId as string);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const handleVoiceNoteUpload = async (blob: Blob) => {
    try {
      const sourceId = await uploadVoiceNote(blob);
      toast({
        title: "Voice note uploaded",
        description: "Voice note uploaded successfully",
        duration: 500,
      });

      refetchSources();
      refetchWeb();
      setSelectedSourceId(sourceId);
      setIsWebDataModalOpen(true);
      setOpen(false);
    } catch (error) {
      console.error("Error uploading voice note:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup MediaRecorder for recording
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Setup AudioContext for visualization
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Cleanup audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center relative px-8 py-16">
      {/* Audio Visualization - Centered and sized appropriately */}
      <div className="flex-1 flex items-center justify-center mb-16">
        <AudioVisualization
          isRecording={isRecording}
          analyserRef={analyserRef}
        />
      </div>

      {/* Bottom Controls */}
      <div className="flex absolute bottom-8 items-center gap-6">
        {/* Recording Button */}
        {!isRecording ? (
          <SimpleTooltip content="Start Recording">
            <Button
              onClick={startRecording}
              disabled={isVoiceNoteUploading}
              className="rounded-full h-16 w-16 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Mic size={24} className="text-white" />
            </Button>
          </SimpleTooltip>
        ) : (
          <SimpleTooltip content="Stop Recording">
            <Button
              onClick={stopRecording}
              className="rounded-full h-16 w-16 flex items-center justify-center transition-colors"
            >
              <div className="w-4 h-4 bg-white rounded-sm" />
            </Button>
          </SimpleTooltip>
        )}

        {/* Upload Button - Only visible when there's a recording */}
        {audioUrl && (
          <SimpleTooltip content="Upload Voice Note">
            <Button
              onClick={() => {
                if (audioBlob) {
                  handleVoiceNoteUpload(audioBlob);
                }
              }}
              disabled={isVoiceNoteUploading}
              className="rounded-full h-16 w-16 flex border dark:bg-violet-400/30 dark:border-violet-200 dark:hover:bg-violet-400/40 items-center justify-center transition-colors disabled:opacity-50"
            >
              {isVoiceNoteUploading ? (
                <Loader size={24} className="animate-spin"></Loader>
              ) : (
                <Download size={24} />
              )}
            </Button>
          </SimpleTooltip>
        )}
      </div>

      {/* Hidden audio element for playback */}
      {audioUrl && <audio src={audioUrl} className="hidden" />}
    </div>
  );
}

export default VoiceRecordModal;
