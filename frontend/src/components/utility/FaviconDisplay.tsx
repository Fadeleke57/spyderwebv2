import Image from "next/image";
import React, { useState, useEffect } from "react";

const FaviconDisplay = ({ url }: { url: string }) => {
  const [faviconUrl, setFaviconUrl] = useState("");
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!url) return;

    try {
      const domain = new URL(url).hostname;

      const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}`;
      setFaviconUrl(googleFavicon);
    } catch (e) {
      console.error("Invalid URL:", e);
    }
  }, [url]);

  const handleError = () => {
    if (!fallback) {
      const domain = new URL(url).hostname;
      setFaviconUrl(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
      setFallback(true);
    }
  };

  if (!url || !faviconUrl) {
    return <div className="w-4 h-4 bg-gray-200 rounded-sm animate-pulse" />;
  }

  return (
    <Image
      src={faviconUrl}
      alt={`Favicon for ${url}`}
      width={16}
      height={16}
      unoptimized
      className="rounded-sm"
      onError={handleError}
    />
  );
};

export default FaviconDisplay;
