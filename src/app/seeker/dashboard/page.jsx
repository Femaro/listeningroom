"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";

import NavigationHeader from "@/components/seeker/dashboard/NavigationHeader";
import WelcomeCard from "@/components/seeker/dashboard/WelcomeCard";
import ActiveSessionCard from "@/components/seeker/dashboard/ActiveSessionCard";
import BeginSessionCard from "@/components/seeker/dashboard/BeginSessionCard";
import AvailableSessionsCard from "@/components/seeker/dashboard/AvailableSessionsCard";
import QuickActions from "@/components/seeker/dashboard/QuickActions";
import HelpModal from "@/components/seeker/dashboard/HelpModal";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";

export default function SeekerDashboard() {
  const { user, loading } = useFirebaseAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // STRICT: Block unverified users
  useEffect(() => {
    if (!loading && user && !user.emailVerified) {
      window.location.href = "/account/awaiting-activation";
      return;
    }
  }, [user, loading]);

  useEffect(() => {
    // For now, we'll set activeSession to null since we're using the new session system
    // This can be enhanced later to check for active sessions in Firestore
    setActiveSession(null);
  }, [user]);

  const handleStartSession = async () => {
    // Redirect to sessions page to browse available sessions
    window.location.href = "/seeker/sessions";
  };

  const handleBookSession = async (sessionId) => {
    // Redirect to session page to join directly
    window.location.href = `/session/${sessionId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Required
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Please sign in to access your dashboard.
          </p>
          <a
            href="/account/signin"
            className="w-full inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <NavigationHeader user={user} onHelpClick={() => setShowHelp(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Banner */}
        <div className="mb-6">
          <EmailVerificationBanner />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <WelcomeCard user={user} />
            {activeSession ? (
              <ActiveSessionCard session={activeSession} />
            ) : (
              <BeginSessionCard
                onStartSession={handleStartSession}
                isMatching={isMatching}
              />
            )}
            <AvailableSessionsCard onBookSession={handleBookSession} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/60 p-8 relative overflow-hidden">
              {/* Decorative gradient background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full opacity-10 blur-3xl"></div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4 relative z-10 flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-teal-600" />
                <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Need Help?
                </span>
              </h3>
              
              <div className="space-y-4 relative z-10">
                <p className="text-gray-700 text-base leading-relaxed">
                  Our platform is here to provide emotional support and someone
                  to listen.
                </p>
                
                <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl p-5 shadow-lg">
                  <div className="space-y-2 text-white">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🔒</span>
                      <span className="font-semibold text-sm">100% Confidential</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">💝</span>
                      <span className="font-semibold text-sm">First 5 Minutes Free</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🌍</span>
                      <span className="font-semibold text-sm">Available 24/7 Worldwide</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4">
                  <p className="text-teal-800 text-sm font-medium">
                    <span className="font-bold">Remember:</span> We provide peer support, not professional therapy. For emergencies, please contact crisis resources.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <a
                  href="/documentation"
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-2xl relative z-10 text-sm"
                >
                  <span>📖 Documentation</span>
                </a>
                <button
                  onClick={() => setShowHelp(true)}
                  className="bg-white border-2 border-teal-500 text-teal-700 px-4 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all duration-300 relative z-10 text-sm"
                >
                  Quick Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
