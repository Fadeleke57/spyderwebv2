import { useRef, useEffect, useState } from "react";

const MorphingContours = () => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      microphoneRef.current.connect(analyserRef.current);
      setIsListening(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopAudioCapture = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      setIsListening(false);
      setAudioLevel(0);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const numShapes = 3;
    const contoursPerShape = 25;
    const points = 100;
    let time = 0;
    const backgroundColor = "#F0EEE6";
    const lineColor = "rgba(50, 50, 50, 0.4)";
    let animationId = null;

    function getAudioData() {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
        const average = sum / dataArrayRef.current.length;
        const normalized = average / 255;
        setAudioLevel(normalized);
        return normalized;
      }
      return 0;
    }

    function draw() {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      time += 0.001;
      const audioIntensity = getAudioData();

      // Scale factor responds to audio - expands and contracts based on volume
      const baseScaleFactor = 1.5;
      const audioScaleFactor = baseScaleFactor + audioIntensity * 2; // Amplify audio response

      const centerX = width / 2;
      const centerY = height / 2;

      for (let shapeIndex = 0; shapeIndex < numShapes; shapeIndex++) {
        const shapePhase = time + (shapeIndex * Math.PI * 2) / numShapes;
        const offsetX = Math.sin(shapePhase * 0.2) * 40 * audioScaleFactor;
        const offsetY = Math.cos(shapePhase * 0.3) * 40 * audioScaleFactor;

        for (let contour = 0; contour < contoursPerShape; contour++) {
          const scale = (30 + contour * 3) * audioScaleFactor;
          const contourOffsetX =
            Math.sin(contour * 0.2 + shapePhase) * 10 * audioScaleFactor;
          const contourOffsetY =
            Math.cos(contour * 0.2 + shapePhase) * 10 * audioScaleFactor;

          ctx.beginPath();
          // Line opacity also responds to audio
          const audioOpacity = 0.2 + audioIntensity * 0.6;
          ctx.strokeStyle = `rgba(50, 50, 50, ${audioOpacity})`;
          ctx.lineWidth = 0.8 + audioIntensity * 1.2;

          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            let radius = scale;

            // Audio adds extra morphing to the radius
            radius +=
              15 * Math.sin(angle * 3 + shapePhase * 2) * audioScaleFactor;
            radius += 10 * Math.cos(angle * 5 - shapePhase) * audioScaleFactor;
            radius +=
              5 * Math.sin(angle * 8 + contour * 0.1) * audioScaleFactor;
            radius += audioIntensity * 30 * Math.sin(angle * 2 + time * 5); // Audio-reactive distortion

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
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-full w-full bg-[#F0EEE6] gap-4">
      <div className="flex gap-4 items-center mb-4">
        <button
          onClick={isListening ? stopAudioCapture : startAudioCapture}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isListening ? "Stop Audio" : "Start Audio"}
        </button>
        <div className="text-sm text-gray-600">
          Audio Level: {Math.round(audioLevel * 100)}%
        </div>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${audioLevel * 100}%` }}
          />
        </div>
      </div>
      <canvas ref={canvasRef} width={550} height={550} className="shadow-lg" />
      <div className="text-xs text-gray-500 max-w-md text-center">
        {isListening
          ? "The contours are now responding to your microphone input - speak, sing, or make sounds!"
          : 'Click "Start Audio" to make the contours respond to sound from your microphone'}
      </div>
    </div>
  );
};

export default MorphingContours;
