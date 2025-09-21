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
    <div className="min-h-screen bg-gray-50">
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
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Need Help?
              </h3>
              <div className="space-y-4 text-sm text-gray-300">
                <p className="text-lg">
                  Our platform is here to provide emotional support and someone
                  to listen.
                </p>
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-400/30 rounded-xl p-4">
                  <p className="text-teal-200 font-medium text-sm">
                    🔒 100% confidential • 💝 First 5 minutes free • 🌍
                    Available 24/7
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(true)}
                className="w-full mt-6 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Learn How It Works
              </button>
            </div>
          </div>
        </div>
      </main>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
