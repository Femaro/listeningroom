"use client";

import { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";
import { useLocation } from "react-router";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function IPhone16ProMaxOptimizer({ children }) {
  const [isIPhone, setIsIPhone] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIPhone(isIOS);
  }, []);

  // Pages that should not have header/footer (full-screen experiences)
  const noLayoutPages = [
    '/session/', // Session rooms are full-screen
    '/admin/login', // Admin login should be standalone
    '/dashboard', // All dashboard pages (seeker, volunteer, admin, training)
    '/seeker/dashboard',
    '/volunteer/dashboard',
    '/admin/dashboard',
    '/training/dashboard',
  ];
  
  const shouldHideLayout = noLayoutPages.some(path => location.pathname.includes(path));

  if (isIPhone) {
    return (
      <div className="iphone-optimized min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-50">
        <style jsx global>{`
          :root {
            /* Use standard iOS safe area variables */
            --safe-area-inset-top: env(safe-area-inset-top);
            --safe-area-inset-bottom: env(safe-area-inset-bottom);
            --safe-area-inset-left: env(safe-area-inset-left);
            --safe-area-inset-right: env(safe-area-inset-right);
          }

          /* Example usage of safe area variables */
          .header-content {
            padding-top: calc(var(--safe-area-inset-top) + 8px);
          }
          .session-dialog {
            bottom: var(--safe-area-inset-bottom);
          }
        `}</style>
        <div className="flex items-center justify-center bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <Smartphone className="w-5 h-5 text-purple-600 mr-2" />
          <span className="text-sm text-purple-800 font-medium">
            ✨ iOS Optimized Experience Active
          </span>
        </div>
        {!shouldHideLayout && <Header />}
        <main className="min-h-[calc(100vh-160px)]">
          {children}
        </main>
        {!shouldHideLayout && <Footer />}
      </div>
    );
  }

  if (shouldHideLayout) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-50">
      <Header />
      <main className="min-h-[calc(100vh-160px)]">
        {children}
      </main>
      <Footer />
    </div>
  );
}