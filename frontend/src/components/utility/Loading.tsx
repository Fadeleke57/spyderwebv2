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

export { LoadingPage };
