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
    <div className="w-full h-full flex justify-center items-center z-50">
      <l-quantum size="150" speed="2.4" color="black"></l-quantum>
    </div>
  );
}

export { LoadingPage };
