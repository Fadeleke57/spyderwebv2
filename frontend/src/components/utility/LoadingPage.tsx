"use client";

import { useEffect } from "react";

function LoadingPage() {
  useEffect(() => {
    const loadQuantum = async () => {
      const { quantum } = await import('ldrs');
      quantum.register();
    };

    loadQuantum();
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <l-quantum size="150" speed="2.4" color="black"></l-quantum>
    </div>
  );
}

export default LoadingPage;
