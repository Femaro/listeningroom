"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Mic, MessageCircle, Globe, Lock } from "lucide-react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { db } from "@/utils/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

export default function CreateSession() {
  const { user, userProfile } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sessionType: "voice", // voice or chat
    maxParticipants: 1,
    duration: 30, // minutes
    isPublic: true,
    specialization: "",
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    scheduledDate: "", // YYYY-MM-DD format
    scheduledTime: "", // HH:MM format
    isScheduled: false, // true for scheduled, false for immediate
  });

  const [availability, setAvailability] = useState({
    isOnline: false,
    isAvailable: false,
    maxConcurrentSessions: 1,
    currentActiveSessions: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAvailabilityStatus();
    }
  }, [user]);

  const fetchAvailabilityStatus = async () => {
    try {
      const availabilityDoc = await getDoc(doc(db, "volunteer_availability", user.uid));
      if (availabilityDoc.exists()) {
        setAvailability(availabilityDoc.data());
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvailabilityToggle = async (field) => {
    try {
      const newValue = !availability[field];
      
      // Use setDoc with merge to create the document if it doesn't exist
      await setDoc(doc(db, "volunteer_availability", user.uid), {
        [field]: newValue,
        lastUpdated: serverTimestamp(),
        // Set default values if creating new document
        isOnline: field === 'isOnline' ? newValue : availability.isOnline,
        isAvailable: field === 'isAvailable' ? newValue : availability.isAvailable,
        maxConcurrentSessions: availability.maxConcurrentSessions || 1,
        currentActiveSessions: availability.currentActiveSessions || 0,
      }, { merge: true });
      
      setAvailability(prev => ({ ...prev, [field]: newValue }));
    } catch (error) {
      console.error("Error updating availability:", error);
      setError("Failed to update availability status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("You must be signed in to create a session");
      }

      if (!availability.isOnline || !availability.isAvailable) {
        throw new Error("You must be online and available to create a session");
      }

      // Extract country from userProfile.location (format: "City, Country")
      let volunteerCountry = "Unknown";
      if (userProfile?.location) {
        const locationParts = userProfile.location.split(",");
        volunteerCountry = locationParts.length > 1 ? locationParts[locationParts.length - 1].trim() : locationParts[0].trim();
      }

      const sessionData = {
        volunteerId: user.uid,
        volunteerName: userProfile?.name || user.displayName,
        volunteerCountry: volunteerCountry, // Add country for filtering
        title: formData.title,
        description: formData.description,
        sessionType: formData.sessionType,
        maxParticipants: parseInt(formData.maxParticipants),
        duration: parseInt(formData.duration),
        isPublic: formData.isPublic,
        specialization: formData.specialization,
        language: formData.language,
        timezone: formData.timezone,
        status: "waiting", // waiting, active, ended
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        participants: [],
        currentParticipants: 0,
        messages: [], // Initialize messages array
      };

      await addDoc(collection(db, "sessions"), sessionData);
      
      // Update volunteer's current active sessions
      await setDoc(doc(db, "volunteer_availability", user.uid), {
        currentActiveSessions: availability.currentActiveSessions + 1,
        lastUpdated: serverTimestamp(),
        // Preserve other availability settings
        isOnline: availability.isOnline,
        isAvailable: availability.isAvailable,
        maxConcurrentSessions: availability.maxConcurrentSessions,
      }, { merge: true });

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        sessionType: "voice",
        maxParticipants: 1,
        duration: 30,
        isPublic: true,
        specialization: "",
        language: "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (err) {
      console.error("Error creating session:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-8 text-lg">Please sign in to create sessions</p>
          <a href="/account/signin" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (success) {
  return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageCircle className="w-10 h-10 text-white" />
            </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Session Created!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Your session is now live and visible to seekers. You'll be notified when someone joins.
          </p>
          <div className="space-y-4">
            <a
              href="/volunteer/dashboard"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold inline-block"
            >
              Back to Dashboard
            </a>
            <button
              onClick={() => setSuccess(false)}
              className="w-full border border-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Create Another Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create a Session</h1>
          <p className="text-gray-600 text-lg">Set up a voice or chat session for seekers to join</p>
        </div>

        {/* Availability Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 ${availability.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="font-semibold text-gray-900 text-lg">Online Status</span>
              </div>
              <button
                onClick={() => handleAvailabilityToggle('isOnline')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  availability.isOnline
                    ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {availability.isOnline ? 'Online' : 'Offline'}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 ${availability.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="font-semibold text-gray-900 text-lg">Available for Sessions</span>
              </div>
              <button
                onClick={() => handleAvailabilityToggle('isAvailable')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  availability.isAvailable
                    ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {availability.isAvailable ? 'Available' : 'Busy'}
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="text-lg">Active Sessions: {availability.currentActiveSessions} / {availability.maxConcurrentSessions}</p>
          </div>
        </div>

        {/* Session Creation Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Session Details</h2>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">Session Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sessionType: 'voice' }))}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                    formData.sessionType === 'voice'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Mic className="w-8 h-8 text-blue-600 mb-3" />
                  <div className="font-semibold text-gray-900 text-lg">Voice Call</div>
                  <div className="text-sm text-gray-600">Real-time audio conversation</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sessionType: 'chat' }))}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                    formData.sessionType === 'chat'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
                  <div className="font-semibold text-gray-900 text-lg">Text Chat</div>
                  <div className="text-sm text-gray-600">Written conversation</div>
                </button>
              </div>
            </div>

            {/* Scheduling Options */}
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Session Timing</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isScheduled: false }))}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    !formData.isScheduled
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Clock className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="font-medium text-gray-900">Start Immediately</div>
                  <div className="text-sm text-gray-600">Session starts right away</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isScheduled: true }))}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    formData.isScheduled
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="font-medium text-gray-900">Schedule for Later</div>
                  <div className="text-sm text-gray-600">Choose date and time</div>
                </button>
              </div>
            </div>

            {/* Scheduled Date and Time */}
            {formData.isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Date
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required={formData.isScheduled}
                  />
                  <p className="text-xs text-gray-500 mt-1">Within next 48 hours</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Time
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required={formData.isScheduled}
                  />
                  <p className="text-xs text-gray-500 mt-1">Your local time</p>
              </div>
            </div>
          )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Title
              </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Mental Health Support Session"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this session is about and what seekers can expect..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {/* Duration and Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <select
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value={1}>1 (One-on-one)</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                </select>
              </div>
            </div>

            {/* Language and Specialization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization (Optional)
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Anxiety, Depression, Grief"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Make this session public (visible to all seekers)
              </label>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="pt-6 space-y-3">
              <button
                type="submit"
                disabled={loading || !availability.isOnline || !availability.isAvailable}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating Session..." : "Create Session"}
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      title: "",
                      description: "",
                      sessionType: "voice",
                      maxParticipants: 1,
                      duration: 30,
                      isPublic: true,
                      specialization: "",
                      language: "en",
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    });
                    setError(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Clear Form
                </button>
                
                <a
                  href="/volunteer/dashboard"
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center"
                >
                  Cancel
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}