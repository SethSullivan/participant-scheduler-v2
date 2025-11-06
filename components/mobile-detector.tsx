"use client";

import { useEffect, useState } from "react";

export default function MobileDetector({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if device is mobile using multiple methods
    const checkMobile = () => {
      // Method 1: Check user agent
      const userAgent = navigator.userAgent || navigator.vendor;
      const mobileRegex =
        /(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/i;

      // Method 2: Check screen width
      const isSmallScreen = window.innerWidth < 768;

      // Method 3: Check touch support
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      return mobileRegex.test(userAgent) || (isSmallScreen && hasTouch);
    };

    setIsMobile(checkMobile());

    // Listen for window resize
    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  console.log("ISMOBILE", isMobile);
  // Show loading state while checking
  if (isMobile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show mobile message
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 text-center">
        <div className="max-w-md">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-4">
            Mobile/Screen Size Not Supported
          </h2>
          <p className="text-gray-600 mb-4">
            This application is not available on mobile devices. Please use a
            desktop or laptop computer to fill out your availability.
          </p>
          <p className="text-sm text-gray-500">
            We&apos;re working on mobile support. Thank you for your patience!
          </p>
        </div>
      </div>
    );
  }

  // Show desktop content
  return <>{children}</>;
}
