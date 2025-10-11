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

    // STRICT: Block unverified users
    if (user && !user.emailVerified) {
      window.location.href = "/account/awaiting-activation";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full mx-auto mb-6 animate-pulse shadow-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="animate-spin h-24 w-24 text-teal-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Loading your dashboard...
          </h2>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in to access your dashboard.
          </p>
          <a
            href="/account/signin"
            className="inline-block bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Error Loading Dashboard
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // This shouldn't be reached as the component redirects
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full mx-auto mb-6 animate-pulse shadow-2xl"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="animate-spin h-24 w-24 text-teal-500" />
          </div>
        </div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
