"use client";

import { useState } from "react";
import { auth } from "@/utils/firebase";
import { sendEmailVerification } from "firebase/auth";
import { Clock, Mail, RefreshCw, AlertTriangle, ArrowLeft, Home } from "lucide-react";

export default function ActivationExpiredPage() {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      const user = auth.currentUser;
      
      if (!user) {
        setError("Please sign in first to resend the verification email.");
        setResendLoading(false);
        return;
      }

      // Check if already verified
      await user.reload();
      if (user.emailVerified) {
        window.location.href = "/dashboard";
        return;
      }

      const actionCodeSettings = {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false,
      };

      await sendEmailVerification(user, actionCodeSettings);
      
      setResendSuccess(true);
      
      // Redirect to awaiting activation page after success
      setTimeout(() => {
        window.location.href = "/account/awaiting-activation";
      }, 3000);
    } catch (err) {
      console.error("Resend email error:", err);
      
      let errorMessage = "Failed to send verification email. Please try again.";
      if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      }
      
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-red-100">
          {/* Icon and Title */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 mb-6">
              <Clock className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Activation Link Expired
            </h1>
            <p className="text-lg text-gray-600">
              Your email verification link has expired for security reasons
            </p>
          </div>

          {/* Explanation */}
          <div className="mt-8 space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Verification Link No Longer Valid
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>For security reasons, verification links expire after 24 hours. This helps protect your account from unauthorized access.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      New Verification Email Sent!
                    </h3>
                    <p className="mt-2 text-sm text-green-700">
                      Please check your inbox for the new verification link. Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <p className="mt-2 text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={resendLoading || resendSuccess}
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Sending New Link...
                  </>
                ) : resendSuccess ? (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    Email Sent Successfully!
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Request New Verification Link
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/account/signin"
                  className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Sign In
                </a>

                <a
                  href="/"
                  className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Home
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happens next?
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 mt-0.5">
                1
              </div>
              <span>Click "Request New Verification Link" above</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 mt-0.5">
                2
              </div>
              <span>Check your email inbox (and spam folder)</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 mt-0.5">
                3
              </div>
              <span>Click the new verification link within 24 hours</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 mt-0.5">
                4
              </div>
              <span>You'll be automatically signed in and redirected to your dashboard</span>
            </li>
          </ul>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Need help? Contact our support team at{" "}
            <a href="mailto:support@listeningroom.com" className="text-teal-600 hover:text-teal-700 font-medium">
              support@listeningroom.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

