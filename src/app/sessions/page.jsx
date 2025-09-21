"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Search,
  ArrowLeft,
  User,
  BookOpen,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Star,
  MapPin,
  Shield,
  MessageCircle,
  Loader,
  Info,
} from "lucide-react";
import useUser from "@/utils/useUser";

function SessionCard({ session, onBook, isBooking }) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeUntilSession = (sessionDate, startTime) => {
    const sessionDateTime = new Date(`${sessionDate}T${startTime}`);
    const now = new Date();
    const timeDiff = sessionDateTime.getTime() - now.getTime();

    if (timeDiff < 0) return "Session has passed";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `In ${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? "s" : ""}`;
    if (minutes > 0) return `In ${minutes} minute${minutes > 1 ? "s" : ""}`;
    return "Starting soon";
  };

  const availableSpots =
    session.max_participants - (session.booked_participants || 0);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {session.title}
            </h3>
            <span className="text-sm text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded-full">
              {getTimeUntilSession(session.session_date, session.start_time)}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(session.session_date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(session.start_time)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">
                {session.volunteer_name || "Volunteer"}
              </span>
            </div>
            {session.volunteer_rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-gray-600">
                  {session.volunteer_rating}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{session.duration_minutes} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{availableSpots} spots left</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{session.volunteer_country || "Global"}</span>
            </div>
          </div>
        </div>
      </div>

      {session.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {session.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <span>
            Code:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded font-mono">
              {session.session_code}
            </code>
          </span>
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Verified volunteer</span>
          </div>
        </div>

        <button
          onClick={() => onBook(session.id)}
          disabled={isBooking || availableSpots <= 0}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isBooking ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Booking...</span>
            </>
          ) : availableSpots <= 0 ? (
            <span>Fully Booked</span>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              <span>Book Session</span>
            </>
          )}
        </button>
      </div>

      {/* Hover Details */}
      {showDetails && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
          <h4 className="font-semibold text-gray-900 mb-2">Session Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>Duration:</strong> {session.duration_minutes} minutes
            </p>
            <p>
              <strong>Participants:</strong> {session.booked_participants || 0}/
              {session.max_participants}
            </p>
            <p>
              <strong>Volunteer Experience:</strong>{" "}
              {session.volunteer_experience || "Experienced listener"}
            </p>
            <p>
              <strong>Specializations:</strong>{" "}
              {session.specializations?.join(", ") || "General support"}
            </p>
            {session.description && (
              <p>
                <strong>About:</strong> {session.description}
              </p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-green-700">
              <CheckCircle className="w-3 h-3" />
              <span>100% confidential and secure</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SessionsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [bookingSessionId, setBookingSessionId] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/scheduled-sessions?status=scheduled&available=true&filter=${filter}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load available sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (sessionId) => {
    if (!user) {
      window.location.href = "/account/signin?callbackUrl=/sessions";
      return;
    }

    setBookingSessionId(sessionId);

    try {
      const response = await fetch("/api/session-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduled_session_id: sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to book session");
      }

      // Show success message
      alert(
        "Session booked successfully! You will receive an email confirmation and reminder.",
      );

      // Refresh sessions list
      fetchSessions();
    } catch (err) {
      console.error("Error booking session:", err);
      alert(err.message || "Failed to book session. Please try again.");
    } finally {
      setBookingSessionId(null);
    }
  };

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.volunteer_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to discover and join sessions with our volunteers.
          </p>
          <a
            href="/account/signin?callbackUrl=/sessions"
            className="w-full inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href="/seeker/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Dashboard</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <img
                src="https://ucarecdn.com/e05f1122-ee17-479a-b4b8-456584592d00/-/format/auto/"
                alt="Listening Room"
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Available Sessions
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Browse and join scheduled sessions with our trained volunteers. Find
            the right support for your needs.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Sessions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, description, or volunteer..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Sessions
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("upcoming")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === "upcoming"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilter("today")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === "today"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setFilter("this_week")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === "this_week"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  This Week
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                How Sessions Work
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Choose a session that fits your schedule and needs</p>
                <p>• Book your spot and receive email confirmation</p>
                <p>• Join at the scheduled time for compassionate support</p>
                <p>• First 5 minutes of each session are completely free</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mr-3"></div>
              <span className="text-gray-600">
                Loading available sessions...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No Sessions Found" : "No Sessions Available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms or check back later for new sessions."
                : "Check back later for new scheduled sessions, or start an instant session from your dashboard."}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setFilter("upcoming")}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                View All Upcoming
              </button>
              <a
                href="/seeker/dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Start Instant Session
              </a>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onBook={handleBookSession}
                isBooking={bookingSessionId === session.id}
              />
            ))}
          </div>
        )}

        {/* Emergency Notice */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Crisis Support Available 24/7
            </span>
          </div>
          <p className="text-xs text-red-600 mb-3">
            If you're in immediate danger or having thoughts of self-harm,
            please contact emergency services or visit your local emergency
            room.
          </p>
          <a
            href="/crisis-resources"
            className="inline-block text-xs text-red-700 hover:text-red-800 font-medium underline"
          >
            View crisis resources →
          </a>
        </div>
      </main>
    </div>
  );
}
