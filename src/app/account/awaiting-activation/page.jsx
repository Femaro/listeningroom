"use client";

import { useState, useEffect } from "react";
import { auth } from "@/utils/firebase";
import { sendEmailVerification, signOut } from "firebase/auth";
import { Mail, Clock, RefreshCw, CheckCircle, AlertCircle, LogOut, ArrowRight } from "lucide-react";

export default function AwaitingActivationPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !auth) {
      return;
    }

    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        // No user, redirect to sign in
        window.location.href = "/account/signin";
        return;
      }

      // User exists, check if already verified
      if (currentUser.emailVerified) {
        // Email is verified, redirect to dashboard
        window.location.href = "/dashboard";
        return;
      }

      // User is not verified, show this page
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-check verification status every 5 seconds
  useEffect(() => {
    if (!user) return;

    const checkInterval = setInterval(async () => {
      try {
        await user.reload();
        if (user.emailVerified) {
          // Verification detected! Redirect to dashboard
          window.location.href = "/dashboard";
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [user]);

  const handleResendEmail = async () => {
    if (countdown > 0 || !user) return;

    setResendLoading(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false,
      };

      await sendEmailVerification(user, actionCodeSettings);
      
      setResendSuccess(true);
      setCountdown(60); // 60 second cooldown

      // Clear success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error("Resend email error:", error);
      
      let errorMessage = "Failed to send verification email. Please try again.";
      if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      }
      
      setResendError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleCheckNow = async () => {
    if (!user) return;
    
    try {
      await user.reload();
      if (user.emailVerified) {
        window.location.href = "/dashboard";
      } else {
        setResendError("Email not verified yet. Please check your inbox and click the verification link.");
        setTimeout(() => setResendError(null), 5000);
      }
    } catch (error) {
      console.error("Error checking verification:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* Icon and Title */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 mb-6">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email Address
            </h1>
            <p className="text-lg text-gray-600">
              We've sent a verification link to
            </p>
            <p className="text-xl font-semibold text-teal-600 mt-2">
              {user?.email}
            </p>
          </div>

          {/* Instructions */}
          <div className="mt-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Important: Activation Required
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>You must verify your email before accessing your dashboard. Please follow these steps:</p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Click the verification link in the email</li>
                      <li>Return to this page or sign in again</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Expiration Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Verification Link Expires in 24 Hours
                  </h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    For security reasons, the activation link will expire after 24 hours. If it expires, you can request a new one using the button below.
                  </p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Verification Email Sent!
                    </h3>
                    <p className="mt-2 text-sm text-green-700">
                      Please check your inbox for the new verification link.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {resendError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <p className="mt-2 text-sm text-red-700">
                      {resendError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleCheckNow}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                I've Verified My Email - Check Now
              </button>

              <button
                onClick={handleResendEmail}
                disabled={resendLoading || countdown > 0}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent mr-2"></div>
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Clock className="h-5 w-5 mr-2" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or click "Resend Verification Email" above.
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why do I need to verify my email?
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Ensures the security of your account</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Allows us to send you important notifications</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Protects against unauthorized access</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Confirms you have access to the email address</span>
            </li>
          </ul>
        </div>

        {/* Auto-refresh Notice */}
        <div className="text-center text-sm text-gray-500">
          <p>
            This page automatically checks for verification every 5 seconds.
            <br />
            Once verified, you'll be redirected automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

