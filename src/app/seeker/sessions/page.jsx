"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Mic, MessageCircle, Clock, Users, Globe, Lock, Play, ArrowLeft, Home, User } from "lucide-react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { db } from "@/utils/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";

export default function BrowseSessions() {
  const { user, userProfile } = useFirebaseAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sessionType: "all", // all, voice, chat
    language: "all",
    specialization: "",
    search: "",
  });
  const [joiningSession, setJoiningSession] = useState(null);

  useEffect(() => {
    if (!user || !userProfile?.location) {
      setLoading(false);
      return;
    }

    // Extract user's country from location
    const locationParts = userProfile.location.split(",");
    const userCountry = locationParts.length > 1 ? locationParts[locationParts.length - 1].trim() : locationParts[0].trim();

    // Set up real-time listener for sessions in user's country
    const q = query(
      collection(db, "sessions"),
      where("status", "==", "waiting"),
      where("isPublic", "==", true),
      where("volunteerCountry", "==", userCountry) // Filter by country
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
        });
      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userProfile]);

  const filteredSessions = sessions.filter(session => {
    if (filters.sessionType !== "all" && session.sessionType !== filters.sessionType) return false;
    if (filters.language !== "all" && session.language !== filters.language) return false;
    if (filters.specialization && !session.specialization?.toLowerCase().includes(filters.specialization.toLowerCase())) return false;
    if (filters.search && !session.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !session.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleJoinSession = async (sessionId) => {
    if (!user) {
      alert("Please sign in to join a session");
      return;
    }

    setJoiningSession(sessionId);
    try {
      const currentSession = sessions.find(s => s.id === sessionId);
      
      if (!currentSession) {
        alert("Session not found");
        return;
      }

      if (currentSession.currentParticipants >= currentSession.maxParticipants) {
        alert("This session is full");
        return;
      }

      if (currentSession.status !== "waiting") {
        alert("This session is no longer available");
        return;
      }

      // Redirect to session room - it will handle adding the user automatically
      window.location.href = `/session/${sessionId}`;
    } catch (error) {
      console.error("Error joining session:", error);
      alert("Failed to join session. Please try again.");
    } finally {
      setJoiningSession(null);
    }
  };

  const getSessionTypeIcon = (type) => {
    return type === "voice" ? <Mic className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />;
  };

  const getSessionTypeColor = (type) => {
    return type === "voice" ? "text-blue-600" : "text-green-600";
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to browse sessions</p>
          <a href="/account/signin" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={() => window.location.href = '/seeker/dashboard'}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/seeker/dashboard'}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <User className="w-5 h-5 mr-2" />
                Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Sessions</h1>
          <p className="text-gray-600">Find and join a session with a volunteer</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.sessionType}
                onChange={(e) => setFilters(prev => ({ ...prev, sessionType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="voice">Voice Calls</option>
                <option value="chat">Text Chat</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={filters.language}
                onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
              <input
                type="text"
                placeholder="e.g., Anxiety, Depression"
                value={filters.specialization}
                onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Available</h3>
            <p className="text-gray-600 mb-6">
              There are no sessions matching your criteria at the moment.
            </p>
            <button
              onClick={() => setFilters({ sessionType: "all", language: "all", specialization: "", search: "" })}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${getSessionTypeColor(session.sessionType)} bg-gray-100`}>
                      {getSessionTypeIcon(session.sessionType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.title}</h3>
                      <p className="text-sm text-gray-500">by {session.volunteerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {session.currentParticipants}/{session.maxParticipants}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{session.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(session.duration)}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Globe className="w-3 h-3 mr-1" />
                    {session.language.toUpperCase()}
                  </span>
                  {session.specialization && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {session.specialization}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleJoinSession(session.id)}
                  disabled={joiningSession === session.id || session.currentParticipants >= session.maxParticipants}
                  className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {joiningSession === session.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {session.currentParticipants >= session.maxParticipants ? "Session Full" : "Join Session"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
