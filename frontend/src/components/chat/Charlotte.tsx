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
    let blinkIntervalId: NodeJS.Timeout | null = null;

    const blink = () => {
      if (!activeEyes) return;

      setEyesBlinked(true);

      // Open eyes after short delay
      setTimeout(() => {
        setEyesBlinked(false);
      }, 150); // eyes closed for 150ms
    };

    // Schedule first blink after a delay
    const initialDelay = Math.random() * 1000 + 2000;
    blinkTimeoutId = setTimeout(() => {
      blink();

      // Set up interval for regular blinking
      const blinkInterval = 4000 + Math.random() * 3000; // 4-7 seconds
      blinkIntervalId = setInterval(blink, blinkInterval);
    }, initialDelay);

    // cleanup function
    return () => {
      if (blinkTimeoutId) clearTimeout(blinkTimeoutId);
      if (blinkIntervalId) clearInterval(blinkIntervalId);
    };
  }, [activeEyes]);

  // calculate eye movements with more range, keeping both eyes in sync
  const calculateEyeMovements = () => {
    // If eyes are not active or blinked, keep eyes centered
    if (!activeEyes || eyesBlinked) {
      return {
        leftEye: { x: -10, y: 0, pupilX: -10, pupilY: 0 },
        rightEye: { x: 10, y: 0, pupilX: 10, pupilY: 0 },
      };
    }

    const leftEyeBase = { x: -10, y: 0 };
    const rightEyeBase = { x: 10, y: 0 };

    // calculate distances for both eyes
    const dxLeft = mousePosition.x - (logoPosition.x + leftEyeBase.x);
    const dyLeft = mousePosition.y - (logoPosition.y + leftEyeBase.y);
    const distanceLeft = Math.sqrt(dxLeft * dxLeft + dyLeft * dyLeft);

    const dxRight = mousePosition.x - (logoPosition.x + rightEyeBase.x);
    const dyRight = mousePosition.y - (logoPosition.y + rightEyeBase.y);
    const distanceRight = Math.sqrt(dxRight * dxRight + dyRight * dyRight);

    const proximityThreshold = 50; // pixels within which eyes won't move

    // If either eye is too close to the mouse, keep both eyes centered
    if (
      distanceLeft <= proximityThreshold ||
      distanceRight <= proximityThreshold
    ) {
      return {
        leftEye: {
          x: leftEyeBase.x,
          y: leftEyeBase.y,
          pupilX: leftEyeBase.x,
          pupilY: leftEyeBase.y,
        },
        rightEye: {
          x: rightEyeBase.x,
          y: rightEyeBase.y,
          pupilX: rightEyeBase.x,
          pupilY: rightEyeBase.y,
        },
      };
    }

    // Otherwise, calculate eye movements normally
    const maxMovement = 8;

    // Calculate movements for left eye
    const moveXLeft =
      (dxLeft / distanceLeft) * Math.min(distanceLeft, maxMovement);
    const moveYLeft =
      (dyLeft / distanceLeft) * Math.min(distanceLeft, maxMovement);
    const pupilXLeft = leftEyeBase.x + moveXLeft * 1.3;
    const pupilYLeft = leftEyeBase.y + moveYLeft * 1.3;

    // Calculate movements for right eye
    const moveXRight =
      (dxRight / distanceRight) * Math.min(distanceRight, maxMovement);
    const moveYRight =
      (dyRight / distanceRight) * Math.min(distanceRight, maxMovement);
    const pupilXRight = rightEyeBase.x + moveXRight * 1.3;
    const pupilYRight = rightEyeBase.y + moveYRight * 1.3;

    return {
      leftEye: {
        x: leftEyeBase.x + moveXLeft,
        y: leftEyeBase.y + moveYLeft,
        pupilX: pupilXLeft,
        pupilY: pupilYLeft,
      },
      rightEye: {
        x: rightEyeBase.x + moveXRight,
        y: rightEyeBase.y + moveYRight,
        pupilX: pupilXRight,
        pupilY: pupilYRight,
      },
    };
  };

  // render the two eyes
  const renderEyes = () => {
    const eyePositions = calculateEyeMovements();
    const { leftEye, rightEye } = eyePositions;

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
