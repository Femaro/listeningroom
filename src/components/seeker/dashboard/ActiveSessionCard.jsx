"use client";

import { useState, useEffect } from "react";
import { MessageCircle, PhoneCall } from "lucide-react";
import VoiceCallModal from "@/components/voice/VoiceCallModal";

export default function ActiveSessionCard({ session }) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [showVoiceCall, setShowVoiceCall] = useState(false);

  useEffect(() => {
    if (!session) return;

    const startTime = new Date(session.started_at);
    const interval = setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor((now - startTime) / 1000);
      setTimeSpent(diffInSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVoiceCall = () => {
    setShowVoiceCall(true);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">Active Session</span>
          </div>
          <div className="text-2xl font-mono font-bold bg-white bg-opacity-20 px-3 py-1 rounded-lg">
            {formatTime(timeSpent)}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-teal-100 text-sm mb-1">Connected with volunteer</p>
          <p className="font-medium text-lg">
            {session.volunteer_country || "Global volunteer"}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => (window.location.href = `/chat/${session.id}`)}
            className="flex-1 bg-white text-teal-600 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Continue Chat</span>
          </button>
          <button
            onClick={handleVoiceCall}
            className="px-4 py-3 bg-teal-400 text-white rounded-lg font-semibold hover:bg-teal-300 transition-colors flex items-center justify-center"
            title="Start secure voice call"
          >
            <PhoneCall className="w-5 h-5" />
          </button>
        </div>

        {timeSpent >= 300 && (
          <div className="mt-4 p-3 bg-orange-500 bg-opacity-90 rounded-lg">
            <p className="text-sm font-medium">
              ✨ Free session ended. Continuing at premium rates to support our
              volunteers.
            </p>
          </div>
        )}
      </div>

      {/* Voice Call Modal */}
      <VoiceCallModal
        isOpen={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        sessionId={session.id}
        isInitiator={true}
        partnerName={session.volunteer_name || "Volunteer"}
      />
    </>
  );
}
