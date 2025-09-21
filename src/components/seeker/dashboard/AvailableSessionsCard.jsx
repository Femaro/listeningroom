"use client";

import { useState, useEffect } from "react";
import { Loader, AlertCircle, Calendar, User, Clock, Play } from "lucide-react";
import { db } from "@/utils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function AvailableSessionsCard({ onBookSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up real-time listener for public sessions
    const q = query(
      collection(db, "sessions"),
      where("status", "==", "waiting"),
      where("isPublic", "==", true)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const sessionsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt
          }))
          .sort((a, b) => {
            // Sort by createdAt in descending order (newest first)
            const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
            const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
            return bTime - aTime;
          })
          .slice(0, 3); // Show only 3 on dashboard
        
        setSessions(sessionsData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Error fetching available sessions:", error);
        setError("Failed to load sessions");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeUntilSession = (timestamp) => {
    if (!timestamp) return "Now";
    const sessionDateTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const timeDiff = sessionDateTime.getTime() - now.getTime();

    if (timeDiff < 0) return "Past";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return "Soon";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Sessions
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin w-6 h-6 text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Sessions
        </h3>
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Sessions
        </h3>
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm mb-3">
            No sessions available right now
          </p>
          <a
            href="/seeker/sessions"
            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            Check all sessions →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Available Sessions
        </h3>
        <a
          href="/seeker/sessions"
          className="text-teal-600 hover:text-teal-700 text-sm font-medium"
        >
          View all →
        </a>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => {
          const availableSpots = session.maxParticipants - (session.currentParticipants || 0);

          return (
            <div
              key={session.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {session.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{session.volunteerName}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{session.duration}min</span>
                    </span>
                  </div>
                </div>
                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full flex-shrink-0">
                  {getTimeUntilSession(session.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  {formatDate(session.createdAt)} at {formatTime(session.createdAt)}
                  <span className="ml-2 text-gray-500">
                    {availableSpots} spot{availableSpots !== 1 ? "s" : ""} left
                  </span>
                </div>
                <button
                  onClick={() => onBookSession(session.id)}
                  disabled={availableSpots <= 0}
                  className="text-xs bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Play className="w-3 h-3 mr-1" />
                  {availableSpots <= 0 ? "Full" : "Join"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          📅 Browse more sessions or create instant connections
        </p>
      </div>
    </div>
  );
}
