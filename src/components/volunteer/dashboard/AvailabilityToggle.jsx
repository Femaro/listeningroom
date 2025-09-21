"use client";

import { useState, useEffect } from "react";
import { Power, Users } from "lucide-react";
import { db } from "@/utils/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import useFirebaseAuth from "@/utils/useFirebaseAuth";

export default function AvailabilityToggle({ availability, onToggle }) {
  const { user } = useFirebaseAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsOnline(availability?.is_online || false);
    setIsAvailable(availability?.is_available || false);
  }, [availability]);

  const handleToggleOnline = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newOnline = !isOnline;
      const newAvailable = newOnline ? isAvailable : false;
      
      await setDoc(doc(db, "volunteer_availability", user.uid), {
        volunteerId: user.uid,
        isOnline: newOnline,
        isAvailable: newAvailable,
        maxConcurrentSessions: availability?.max_concurrent_sessions || 1,
        currentActiveSessions: availability?.current_active_sessions || 0,
        statusMessage: newOnline ? "Online and ready to help" : "Currently offline",
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setIsOnline(newOnline);
      if (!newOnline) setIsAvailable(false);
      onToggle();
    } catch (error) {
      console.error("Error updating online status:", error);
    }
    setLoading(false);
  };

  const handleToggleAvailable = async () => {
    if (!isOnline || !user) return;

    setLoading(true);
    try {
      const newAvailable = !isAvailable;
      
      await setDoc(doc(db, "volunteer_availability", user.uid), {
        volunteerId: user.uid,
        isOnline: isOnline,
        isAvailable: newAvailable,
        maxConcurrentSessions: availability?.max_concurrent_sessions || 1,
        currentActiveSessions: availability?.current_active_sessions || 0,
        statusMessage: newAvailable ? "Available for sessions" : "Online but not available",
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setIsAvailable(newAvailable);
      onToggle();
    } catch (error) {
      console.error("Error updating availability:", error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
        Availability Status
      </h3>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Power className="w-5 h-5 text-gray-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900 text-sm sm:text-base">
                Online
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Visible to seekers
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={loading}
            className={`availability-toggle touch-target relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isOnline ? "bg-blue-600" : "bg-gray-300"
            } ${loading ? "opacity-50" : "hover:bg-opacity-80"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isOnline ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900 text-sm sm:text-base">
                Available for Sessions
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Ready to help users
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleAvailable}
            disabled={loading || !isOnline}
            className={`availability-toggle touch-target relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isAvailable ? "bg-blue-600" : "bg-gray-300"
            } ${loading || !isOnline ? "opacity-50" : "hover:bg-opacity-80"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAvailable ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${isOnline && isAvailable ? "bg-green-500" : isOnline ? "bg-yellow-500" : "bg-gray-400"}`}
            ></div>
            <span className="text-sm sm:text-base font-medium text-gray-700">
              {isOnline && isAvailable
                ? "Active - Ready for sessions"
                : isOnline
                  ? "Online - Not accepting sessions"
                  : "Offline"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
