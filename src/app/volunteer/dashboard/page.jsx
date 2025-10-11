"use client";

import { useState, useEffect } from "react";
import { Calendar, Activity, Plus, BookOpen } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useVolunteerDashboard } from "@/hooks/useVolunteerDashboard";
import LoadingIndicator from "@/components/volunteer/dashboard/LoadingIndicator";
import AccessRequired from "@/components/volunteer/dashboard/AccessRequired";
import NavigationHeader from "@/components/volunteer/dashboard/NavigationHeader";
import WelcomeCard from "@/components/volunteer/dashboard/WelcomeCard";
import QuickActions from "@/components/volunteer/dashboard/QuickActions";
import ImpactSummary from "@/components/volunteer/dashboard/ImpactSummary";
import HelpModal from "@/components/volunteer/dashboard/HelpModal";
import OverviewTab from "@/components/volunteer/dashboard/OverviewTab";
import ScheduledSessionsTab from "@/components/volunteer/dashboard/ScheduledSessionsTab";
import OnlineToggle from "@/components/volunteer/dashboard/OnlineToggle";
import TextBasedTrainingDashboard from "@/components/volunteer/dashboard/TextBasedTrainingDashboard";

export default function VolunteerDashboard() {
  const {
    user,
    loading,
    activeSession,
    stats,
    availability,
    fetchDashboardData,
    handleTimeUpdate,
    handleAutoTerminate,
  } = useVolunteerDashboard();

  const location = useLocation();
  const pathname = location.pathname;
  const [activeTab, setActiveTab] = useState("overview");
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // STRICT: Block unverified users
  useEffect(() => {
    if (!loading && user && !user.emailVerified) {
      window.location.href = "/account/awaiting-activation";
      return;
    }
  }, [user, loading]);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem(
      `volunteer_visited_before_${user?.id}`,
    );
    if (!hasVisitedBefore && user) {
      setIsFirstTime(true);
      localStorage.setItem(`volunteer_visited_before_${user.id}`, "true");
    }
  }, [user]);

  // Set active tab based on current path
  useEffect(() => {
    if (pathname?.includes('/volunteer/sessions/create')) {
      setActiveTab("create");
    } else if (pathname?.includes('/volunteer/dashboard')) {
      setActiveTab("overview");
    }
  }, [pathname]);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return <AccessRequired />;
  }

  return (
    <div className="w-full">
      <NavigationHeader
        user={user}
        onSettingsClick={() => setShowSettings(true)}
        onHelpClick={() => setShowHelp(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <WelcomeCard user={user} isFirstTime={isFirstTime} />

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/60">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-4 pt-6 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "overview"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    <Activity className="w-4 h-4 inline mr-2" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("sessions")}
                    className={`pb-4 pt-6 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "sessions"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Scheduled Sessions
                  </button>
                  <button
                    onClick={() => setActiveTab("training")}
                    className={`pb-4 pt-6 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "training"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Training
                  </button>
                  <a
                    href="/volunteer/sessions/create"
                    className={`pb-4 pt-6 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "create"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Session
                  </a>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <OverviewTab
                    availability={availability}
                    onToggleAvailability={fetchDashboardData}
                    stats={stats}
                    activeSession={activeSession}
                    onTimeUpdate={handleTimeUpdate}
                    onAutoTerminate={handleAutoTerminate}
                    onRefresh={fetchDashboardData}
                  />
                )}

                {activeTab === "sessions" && (
                  <ScheduledSessionsTab user={user} />
                )}

        {activeTab === "training" && (
          <TextBasedTrainingDashboard />
        )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <OnlineToggle 
              availability={availability} 
              onAvailabilityChange={fetchDashboardData}
              loading={loading}
            />
            <QuickActions />
            <ImpactSummary stats={stats} />
          </div>
        </div>
      </main>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
