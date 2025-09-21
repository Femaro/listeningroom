"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader, Mail, AlertCircle } from "lucide-react";

export default function ActivatePage() {
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Get token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      setToken(urlToken);
      verifyToken(urlToken);
    } else {
      setStatus("error");
      setMessage("No verification token provided");
    }
  }, []);

  const verifyToken = async (verificationToken) => {
    try {
      setStatus("loading");

      const response = await fetch(
        `/api/auth/verify-email?token=${verificationToken}`,
      );
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message);

        // Redirect to dashboard after successful verification
        setTimeout(() => {
          setIsRedirecting(true);
          window.location.href = "/seeker/dashboard";
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img
            src="https://ucarecdn.com/e05f1122-ee17-479a-b4b8-456584592d00/-/format/auto/"
            alt="Listening Room"
            className="h-12 w-auto mx-auto mb-6"
          />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            {status === "loading" && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Verifying Email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Email Verified Successfully!
                </h2>
                <p className="text-gray-600">{message}</p>

                {isRedirecting && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 text-green-600 animate-spin" />
                      <span className="text-green-800 text-sm">
                        Redirecting to your dashboard...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Verification Failed
                </h2>
                <p className="text-gray-600">{message}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            {status === "success" && !isRedirecting && (
              <a
                href="/seeker/dashboard"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              >
                Go to Dashboard
              </a>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <a
                  href="/account/signin"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Create New Account
                </a>
              </div>
            )}

            {status === "loading" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Please wait</p>
                    <p>
                      This may take a few moments to process your verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Need help with email verification?
              </p>
              <div className="space-y-2">
                <a
                  href="/contact"
                  className="text-sm text-teal-600 hover:text-teal-500 font-medium"
                >
                  Contact Support
                </a>
                <span className="text-gray-300 mx-2">•</span>
                <a
                  href="/faq"
                  className="text-sm text-teal-600 hover:text-teal-500 font-medium"
                >
                  FAQ
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Security Notice</p>
              <p>
                For your security, email verification links expire after 24
                hours. If your link has expired, you can request a new one from
                your account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
