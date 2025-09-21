"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, Users, UserX } from "lucide-react";
import { db } from "@/utils/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import useFirebaseAuth from "@/utils/useFirebaseAuth";

export default function OnlineToggle({ 
  availability, 
  onAvailabilityChange, 
  loading = false 
}) {
  const { user } = useFirebaseAuth();
  const [isOnline, setIsOnline] = useState(availability?.is_online || false);
  const [isAvailable, setIsAvailable] = useState(availability?.is_available || false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (availability) {
      setIsOnline(availability.is_online || false);
      setIsAvailable(availability.is_available || false);
    }
  }, [availability]);

  const handleOnlineToggle = async () => {
    if (isUpdating || !user) return;
    
    setIsUpdating(true);
    try {
      const newOnlineStatus = !isOnline;
      const newAvailableStatus = newOnlineStatus ? isAvailable : false; // If going offline, also set unavailable
      
      await setDoc(doc(db, "volunteer_availability", user.uid), {
        volunteerId: user.uid,
        isOnline: newOnlineStatus,
        isAvailable: newAvailableStatus,
        statusMessage: newOnlineStatus ? "Online and ready to help" : "Currently offline",
        maxConcurrentSessions: availability?.max_concurrent_sessions || 1,
        currentActiveSessions: availability?.current_active_sessions || 0,
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setIsOnline(newOnlineStatus);
      setIsAvailable(newAvailableStatus);
      onAvailabilityChange?.({
        is_online: newOnlineStatus,
        is_available: newAvailableStatus,
        status_message: newOnlineStatus ? "Online and ready to help" : "Currently offline",
        max_concurrent_sessions: availability?.max_concurrent_sessions || 1,
        current_active_sessions: availability?.current_active_sessions || 0,
      });
    } catch (error) {
      console.error('Error updating online status:', error);
      alert('Error updating status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvailableToggle = async () => {
    if (isUpdating || !isOnline || !user) return; // Can only be available if online
    
    setIsUpdating(true);
    try {
      const newAvailableStatus = !isAvailable;
      
      await setDoc(doc(db, "volunteer_availability", user.uid), {
        volunteerId: user.uid,
        isOnline: isOnline,
        isAvailable: newAvailableStatus,
        statusMessage: newAvailableStatus ? "Available for sessions" : "Online but not available",
        maxConcurrentSessions: availability?.max_concurrent_sessions || 1,
        currentActiveSessions: availability?.current_active_sessions || 0,
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setIsAvailable(newAvailableStatus);
      onAvailabilityChange?.({
        is_online: isOnline,
        is_available: newAvailableStatus,
        status_message: newAvailableStatus ? "Available for sessions" : "Online but not available",
        max_concurrent_sessions: availability?.max_concurrent_sessions || 1,
        current_active_sessions: availability?.current_active_sessions || 0,
      });
    } catch (error) {
      console.error('Error updating availability status:', error);
      alert('Error updating availability. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Availability Status
      </h3>
      
      <div className="space-y-4">
        {/* Online/Offline Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
              {isOnline ? (
                <Wifi className={`w-5 h-5 ${isOnline ? 'text-green-600' : 'text-gray-400'}`} />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-sm text-gray-500">
                {isOnline ? 'You are visible to the system' : 'You are not visible to seekers'}
              </p>
            </div>
          </div>
          <button
            onClick={handleOnlineToggle}
            disabled={isUpdating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isOnline ? 'bg-blue-600' : 'bg-gray-300'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-80'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isOnline ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Available for Sessions Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isAvailable ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {isAvailable ? (
                <Users className={`w-5 h-5 ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`} />
              ) : (
                <UserX className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {isAvailable ? 'Available for Sessions' : 'Not Available'}
              </p>
              <p className="text-sm text-gray-500">
                {isAvailable 
                  ? 'You will appear in available volunteers list' 
                  : 'You won\'t be matched with new sessions'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleAvailableToggle}
            disabled={isUpdating || !isOnline}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isAvailable ? 'bg-blue-600' : 'bg-gray-300'
            } ${(isUpdating || !isOnline) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-80'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>


        {/* Status Message */}
        {isOnline && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status:</span> {availability?.status_message || 'No status message set'}
            </p>
          </div>
        )}

        {/* Current Stats */}
        {isOnline && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {availability?.current_active_sessions || 0}
              </p>
              <p className="text-sm text-gray-600">Active Sessions</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {availability?.max_concurrent_sessions || 1}
              </p>
              <p className="text-sm text-gray-600">Max Sessions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
