import React, { useState, useEffect, useRef } from "react";

export default function Charlotte({
  width,
  height,
  activeEyes = true,
}: {
  width?: number;
  height?: number;
  activeEyes?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [eyesBlinked, setEyesBlinked] = useState(false);
  const logoRef = useRef(null);
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });

  // track mouse position globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // update logo position whenever it might change
  useEffect(() => {
    const updateLogoPosition = () => {
      if (logoRef.current) {
        const rect = (logoRef.current as HTMLElement).getBoundingClientRect();
        setLogoPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    // update position initially
    updateLogoPosition();

    // also update on window resize or scroll
    window.addEventListener("resize", updateLogoPosition);
    window.addEventListener("scroll", updateLogoPosition);

    return () => {
      window.removeEventListener("resize", updateLogoPosition);
      window.removeEventListener("scroll", updateLogoPosition);
    };
  }, []);

  // set up blinking effect
  useEffect(() => {
    let blinkTimeoutId: NodeJS.Timeout | null = null;

    const blink = () => {
      if (!activeEyes) return;

      setEyesBlinked(true);

      setTimeout(() => {
        setEyesBlinked(false);

        // schedule next blink with random delay
        const nextBlinkDelay = Math.random() * 3000 + 2000; // 2-5 seconds
        blinkTimeoutId = setTimeout(blink, nextBlinkDelay);
      }, 150); // eyes closed for 150ms
    };

    // start blinking automatically
    const initialDelay = Math.random() * 1000 + 500; // 0.5-1.5 seconds for first blink
    blinkTimeoutId = setTimeout(blink, initialDelay);

    // cleanup function
    return () => {
      if (blinkTimeoutId) clearTimeout(blinkTimeoutId);
    };
  }, [activeEyes]);

  // calculate eye movements with more range
  const calculateEyeMovement = (baseX: number, baseY: number) => {
    // If eyes are not active or blinked, keep eyes centered
    if (!activeEyes || eyesBlinked)
      return { x: baseX, y: baseY, pupilX: baseX, pupilY: baseY };

    // calculate direction vector from eye to mouse
    const dx = mousePosition.x - (logoPosition.x + baseX);
    const dy = mousePosition.y - (logoPosition.y + baseY);

    // calculate distance from logo center
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxMovement = 8; // increased range of movement
    const proximityThreshold = 50; // pixels within which eyes won't move

    // If mouse is too close, keep eyes centered
    if (distance <= proximityThreshold)
      return { x: baseX, y: baseY, pupilX: baseX, pupilY: baseY };

    if (distance === 0)
      return { x: baseX, y: baseY, pupilX: baseX, pupilY: baseY };

    const moveX = (dx / distance) * Math.min(distance, maxMovement);
    const moveY = (dy / distance) * Math.min(distance, maxMovement);

    // calculate pupil position (slightly more movement than the eyeball)
    const pupilX = baseX + moveX * 1.3;
    const pupilY = baseY + moveY * 1.3;

    return {
      x: baseX + moveX,
      y: baseY + moveY,
      pupilX,
      pupilY,
    };
  };

  // render the two eyes
  const renderEyes = () => {
    // define base positions for two eyes
    const leftEyeBase = { x: -10, y: 0 };
    const rightEyeBase = { x: 10, y: 0 };

    const leftEye = calculateEyeMovement(leftEyeBase.x, leftEyeBase.y);
    const rightEye = calculateEyeMovement(rightEyeBase.x, rightEyeBase.y);

    return (
      <>
        {/* left eye */}
        {!eyesBlinked && (
          <>
            <circle cx={leftEye.x} cy={leftEye.y} r={9} fill="white" />
            {/*pupils
              <circle
                cx={leftEye.pupilX}
                cy={leftEye.pupilY}
                r={4}
                fill="black"
              />
            */}
          </>
        )}

        {/* right eye */}
        {!eyesBlinked && (
          <>
            <circle cx={rightEye.x} cy={rightEye.y} r={9} fill="white" />
            {/*pupils
             <circle
                cx={rightEye.pupilX}
                cy={rightEye.pupilY}
                r={4}
                fill="black"
              />
            */}
          </>
        )}
      </>
    );
  };

  return (
    <div className="logo-container flex items-center justify-center">
      <div
        ref={logoRef}
        className={`relative w-${width ? width : 20} h-${height ? height : 20} rounded-full flex items-center justify-center`}
      >
        <svg
          viewBox="-50 -50 100 100"
          width="100%"
          height="100%"
          className="overflow-visible"
        >
          {/* simple circle body */}
          <circle cx="0" cy="0" r="35" fill="#a78bfa" />

          {/* eyes */}
          {renderEyes()}
        </svg>
      </div>
    </div>
  );
}
