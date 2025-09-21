"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3,
  Play,
  MessageCircle,
  Mic,
  Eye,
  UserCheck,
} from "lucide-react";
import { db } from "@/utils/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function ScheduledSessionsTab({ user }) {
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [errorSessions, setErrorSessions] = useState(null);

  useEffect(() => {
    if (!user) return;

    setLoadingSessions(true);
    setErrorSessions(null);

    // Set up real-time listener for sessions created by this volunteer
    const q = query(
      collection(db, "sessions"),
      where("volunteerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const sessionsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Generate a session code for display
            session_code: doc.id.substring(0, 8).toUpperCase(),
            // Map Firestore fields to expected format
            session_date: doc.data().createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            start_time: doc.data().createdAt?.toDate?.()?.toTimeString().split(' ')[0] || new Date().toTimeString().split(' ')[0],
            duration_minutes: doc.data().duration || 30,
            max_participants: doc.data().maxParticipants || 1,
            booked_participants: doc.data().currentParticipants || 0,
            title: doc.data().title || "Session",
            description: doc.data().description || "",
            status: doc.data().status || "waiting",
            createdAt: doc.data().createdAt
          }))
          .sort((a, b) => {
            // Sort by createdAt in descending order (newest first)
            const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
            const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
            return bTime - aTime;
          });
        setScheduledSessions(sessionsData);
        setLoadingSessions(false);
      },
      (error) => {
        console.error("Error fetching scheduled sessions:", error);
        setErrorSessions(error.message);
        setLoadingSessions(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleCopySessionCode = (sessionCode) => {
    navigator.clipboard.writeText(sessionCode);
  };

  const handleCancelSession = async (sessionId) => {
    if (
      !confirm(
        "Are you sure you want to cancel this session? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      // Update session status to cancelled instead of deleting
      await updateDoc(doc(db, "sessions", sessionId), {
        status: "cancelled",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error cancelling session:", error);
      setErrorSessions(error.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      scheduled: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock3 },
      live: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      completed: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: CheckCircle,
      },
      cancelled: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    };

    const style = statusStyles[status] || statusStyles.scheduled;
    const IconComponent = style.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Scheduled Sessions
          </h2>
          <p className="text-gray-600 text-sm">
            Manage your upcoming and completed sessions
          </p>
        </div>
        <a
          href="/volunteer/sessions/create"
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </a>
      </div>

      {/* Session Statistics */}
      {scheduledSessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Total Sessions</p>
                <p className="text-2xl font-semibold text-blue-600">{scheduledSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Active Sessions</p>
                <p className="text-2xl font-semibold text-green-600">
                  {scheduledSessions.filter(s => s.status === "waiting" || s.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Total Participants</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {scheduledSessions.reduce((total, session) => total + (session.participants?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-900">Completed</p>
                <p className="text-2xl font-semibold text-orange-600">
                  {scheduledSessions.filter(s => s.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {loadingSessions ? (
        <div className="p-8 text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
            <span className="text-gray-600">
              Loading sessions...
            </span>
          </div>
        </div>
      ) : errorSessions ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">
              Error loading sessions: {errorSessions}
            </p>
          </div>
        </div>
      ) : scheduledSessions.length === 0 ? (
        <div className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Sessions Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first scheduled session to start helping
            users at specific times.
          </p>
          <a
            href="/volunteer/sessions/create"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Session
          </a>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {scheduledSessions.map((session) => (
            <div key={session.id} className="py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-medium text-gray-900 mr-3">
                      {session.title}
                    </h4>
                    {getStatusBadge(session.status)}
                  </div>

                  {session.description && (
                    <p className="text-gray-600 mb-3">
                      {session.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(session.session_date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(session.start_time)}
                    </div>
                    <div className="flex items-center">
                      <Clock3 className="w-4 h-4 mr-2" />
                      {session.duration_minutes} min
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {session.booked_participants || 0}/
                      {session.max_participants}
                    </div>
                  </div>

                  {/* Session Type and Language */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      {session.sessionType === "voice" ? (
                        <Mic className="w-4 h-4 mr-1 text-blue-600" />
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-1 text-green-600" />
                      )}
                      <span className="font-medium">
                        {session.sessionType === "voice" ? "Voice Call" : "Text Chat"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500">Language:</span>
                      <span className="ml-1 font-medium uppercase">{session.language || "EN"}</span>
                    </div>
                    {session.specialization && (
                      <div className="flex items-center">
                        <span className="text-gray-500">Focus:</span>
                        <span className="ml-1 font-medium">{session.specialization}</span>
                      </div>
                    )}
                  </div>

                  {/* Participants List */}
                  {session.participants && session.participants.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center mb-2">
                        <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Participants ({session.participants.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {session.participants.map((participant, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-green-50 text-green-800 px-2 py-1 rounded-full text-xs"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {participant.userName || "Anonymous"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center">
                    <span className="text-sm text-gray-500 mr-2">
                      Session Code:
                    </span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                      {session.session_code}
                    </code>
                    <button
                      onClick={() =>
                        handleCopySessionCode(
                          session.session_code,
                        )
                      }
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                      title="Copy session code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  {/* Rejoin/Join Button - Available for all active sessions */}
                  {(session.status === "waiting" || session.status === "active" || session.status === "live") && (
                    <a
                      href={`/session/${session.id}`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {session.status === "waiting" ? "Start Session" : "Rejoin Session"}
                    </a>
                  )}

                  {/* Session Details Button */}
                  <button
                    onClick={() => {
                      // Show session details modal or expand view
                      alert(`Session Details:\n\nTitle: ${session.title}\nType: ${session.sessionType}\nParticipants: ${session.participants?.length || 0}\nStatus: ${session.status}`);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>

                  {/* Cancel Button - Only for waiting/scheduled sessions */}
                  {(session.status === "waiting" || session.status === "scheduled") && (
                    <button
                      onClick={() => handleCancelSession(session.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancel Session
                    </button>
                  )}

                  {/* Session Stats */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span>Created:</span>
                      <span>{formatDate(session.session_date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Participants:</span>
                      <span>{session.participants?.length || 0}/{session.max_participants}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}