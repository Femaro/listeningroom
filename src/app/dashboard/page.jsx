"use client";

import { useState, useEffect } from "react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { AlertTriangle, Loader } from "lucide-react";

export default function DashboardRouter() {
  const { user, userProfile, loading: userLoading } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/account/signin";
      return;
    }

    if (user && userProfile) {
      // Route based on user type from Firestore profile
      switch (userProfile.userType) {
        case "volunteer":
          window.location.href = "/volunteer/dashboard";
          break;
        case "seeker":
          window.location.href = "/seeker/dashboard";
          break;
        case "admin":
          window.location.href = "/admin/dashboard";
          break;
        default:
          // Unknown user type, redirect to onboarding
          window.location.href = "/onboarding";
          break;
      }
    } else if (user && !userProfile && !userLoading) {
      // User exists but no profile, redirect to onboarding
      // Only redirect if we're not already loading
      window.location.href = "/onboarding";
    }
  }, [user, userProfile, userLoading]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-4">
            Please sign in to access your dashboard.
          </p>
          <a
            href="/account/signin"
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // This shouldn't be reached as the component redirects
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin h-12 w-12 text-teal-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
