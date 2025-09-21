"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Star,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  MessageCircle,
  Heart,
  Shield,
  Loader,
  Info
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

  const availableSpots = session.max_participants - (session.booked_participants || 0);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {session.title}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(session.session_date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(session.start_time)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{availableSpots} spots left</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1">
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
                <span className="text-gray-600">{session.volunteer_rating}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600 mb-1">
            {session.duration_minutes} min
          </div>
          <div className="text-xs text-gray-500">
            {session.session_currency === 'USD' ? 'Free first 5 min' : 'Free session'}
          </div>
        </div>
      </div>

      {session.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {session.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{session.volunteer_country || 'Global'}</span>
          </div>
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
            <p><strong>Duration:</strong> {session.duration_minutes} minutes</p>
            <p><strong>Participants:</strong> {session.booked_participants || 0}/{session.max_participants}</p>
            <p><strong>Volunteer Experience:</strong> {session.volunteer_experience || 'Experienced listener'}</p>
            <p><strong>Specializations:</strong> {session.specializations?.join(', ') || 'General support'}</p>
            {session.description && (
              <p><strong>About:</strong> {session.description}</p>
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

export default function BookSessionPage() {
  const { data: user, loading } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSessionId, setBookingSessionId] = useState(null);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    fetchAvailableSessions();
  }, [filter]);

  const fetchAvailableSessions = async () => {
    try {
      setLoadingSessions(true);
      setError(null);
      const response = await fetch(`/api/scheduled-sessions?status=scheduled&available=true&filter=${filter}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load available sessions. Please try again.');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleBookSession = async (sessionId) => {
    if (!user) {
      window.location.href = '/account/signin?callbackUrl=/sessions/book';
      return;
    }

    setBookingSessionId(sessionId);
    
    try {
      const response = await fetch('/api/session-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_session_id: sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book session');
      }

      // Show success message
      alert('Session booked successfully! You will receive an email confirmation and reminder.');
      
      // Refresh sessions list
      fetchAvailableSessions();
      
    } catch (err) {
      console.error('Error booking session:', err);
      alert(err.message || 'Failed to book session. Please try again.');
    } finally {
      setBookingSessionId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to book sessions with our volunteers.
          </p>
          <a
            href="/account/signin?callbackUrl=/sessions/book"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Book a Session</h1>
          <p className="text-gray-600 max-w-2xl">
            Schedule time with one of our trained volunteers. Choose from available sessions 
            based on your preferences and needs.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">How Session Booking Works</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Choose a session that fits your schedule and preferences</p>
                <p>• You'll receive email confirmation and reminders</p>
                <p>• Join the session at the scheduled time using the provided link</p>
                <p>• First 5 minutes of each session are completely free</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setFilter('upcoming')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'upcoming'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming Sessions
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'today'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Today
            </button>
            <button
              onClick={() => setFilter('this_week')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'this_week'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              This Week
            </button>
          </nav>
        </div>

        {/* Sessions Grid */}
        {loadingSessions ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mr-3"></div>
              <span className="text-gray-600">Loading available sessions...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Available Sessions
            </h3>
            <p className="text-gray-600 mb-6">
              There are no sessions available for the selected time period. 
              Try a different filter or check back later.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setFilter('upcoming')}
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
            {sessions.map((session) => (
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
            <span className="text-sm font-medium text-red-800">Crisis Support Available 24/7</span>
          </div>
          <p className="text-xs text-red-600 mb-3">
            If you're in immediate danger or having thoughts of self-harm, 
            please contact emergency services or visit your local emergency room.
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