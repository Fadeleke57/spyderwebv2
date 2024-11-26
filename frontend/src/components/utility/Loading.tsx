"use client";

import { useEffect } from "react";

function LoadingPage() {
  useEffect(() => {
    const loadQuantum = async () => {
      const { quantum } = await import("ldrs");
      quantum.register();
    };

    loadQuantum();
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center z-50">
      <l-quantum size="150" speed="2.4" color="black"></l-quantum>
    </div>
  );
}


function Uploading() {
  useEffect(() => {
    const loadWave = async () => {
      const { waveform} = await import("ldrs");
      waveform.register();
    };

    loadWave();
  }, []);

  return <l-waveform size="35" stroke="7" speed="1" color="black"></l-waveform>;
}

export const LandingLoader = () => {
  useEffect(() => {
    const loadGrid = async () => {
      const { grid } = await import("ldrs");
      console.log("grid", grid);
      grid.register();
    };
    loadGrid();
  });
  return (
    <div className="w-full h-full flex justify-center items-center z-50">
      <l-grid size="60" speed="1.5" color="black"></l-grid>
    </div>
  );
};

export const VideoLoader = () => {
  useEffect(() => {
    const loadVideo = async () => {
      const { hourglass } = await import("ldrs");
      hourglass.register();
    };
    loadVideo();
  });
  return (
    <div className="w-full h-full flex justify-center items-center z-50">
      <l-hourglass
        size="40"
        bg-opacity="0.1"
        speed="1.75"
        color="black"
      ></l-hourglass>
    </div>
  );
};

export { LoadingPage, Uploading };
