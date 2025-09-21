"use client";

import { useState, useEffect } from "react";
import { 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  X,
  Clock,
  Shield
} from "lucide-react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/utils/firebase";

export default function EmailVerificationBanner() {
  const { user, loading } = useFirebaseAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [lastResendTime, setLastResendTime] = useState(null);

  // Check if user needs email verification
  const needsVerification = user && !user.emailVerified && !loading;

  // Auto-hide banner after dismissal
  useEffect(() => {
    if (!needsVerification) {
      setIsVisible(false);
    }
  }, [needsVerification]);

  // Check for dismissed state in localStorage
  useEffect(() => {
    if (user?.id) {
      const dismissed = localStorage.getItem(`email-verification-dismissed-${user.id}`);
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      // Show banner again if it was dismissed more than 24 hours ago
      if (dismissedTime < oneDayAgo) {
        setIsVisible(true);
        localStorage.removeItem(`email-verification-dismissed-${user.uid}`);
      } else {
        setIsVisible(false);
      }
    }
  }, [user?.uid]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage("");
    setResendError("");

    try {
      // Use Firebase Auth to resend verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/account/signin`,
        handleCodeInApp: true,
      });

      setResendMessage("Verification email sent! Please check your inbox.");
      setLastResendTime(Date.now());
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setResendMessage("");
      }, 5000);
    } catch (error) {
      console.error("Resend verification error:", error);
      setResendError("Failed to resend verification email. Please try again.");
      
      setTimeout(() => {
        setResendError("");
      }, 8000);
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    if (user?.uid) {
      localStorage.setItem(`email-verification-dismissed-${user.uid}`, Date.now().toString());
    }
    setIsVisible(false);
  };

  const canResend = () => {
    if (!lastResendTime) return true;
    const timeSinceLastResend = Date.now() - lastResendTime;
    const oneMinute = 60 * 1000;
    return timeSinceLastResend > oneMinute;
  };

  const getTimeUntilNextResend = () => {
    if (!lastResendTime) return 0;
    const timeSinceLastResend = Date.now() - lastResendTime;
    const oneMinute = 60 * 1000;
    const timeRemaining = oneMinute - timeSinceLastResend;
    return Math.max(0, Math.ceil(timeRemaining / 1000));
  };

  if (!needsVerification || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-orange-800 mb-1">
                  Please verify your email address
                </h3>
                <p className="text-sm text-orange-700 mb-3">
                  We sent a verification email to <strong>{user?.email}</strong>. 
                  Please check your inbox and click the verification link to activate your account.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending || !canResend()}
                    className="inline-flex items-center space-x-2 text-sm font-medium text-orange-700 hover:text-orange-800 disabled:text-orange-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>
                      {!canResend() 
                        ? `Resend in ${getTimeUntilNextResend()}s` 
                        : "Resend verification email"
                      }
                    </span>
                  </button>

                  <a
                    href="/contact"
                    className="text-sm font-medium text-orange-700 hover:text-orange-800 transition-colors"
                  >
                    Need help?
                  </a>
                </div>

                {/* Status Messages */}
                {resendMessage && (
                  <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{resendMessage}</span>
                  </div>
                )}

                {resendError && (
                  <div className="flex items-center space-x-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{resendError}</span>
                  </div>
                )}

                {/* Important Notice */}
                <div className="bg-orange-100 border border-orange-200 rounded p-3">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-orange-700">
                      <p className="font-medium mb-1">Why verify your email?</p>
                      <ul className="space-y-1">
                        <li>• Receive important security notifications</li>
                        <li>• Get session confirmations and updates</li>
                        <li>• Access all platform features</li>
                        <li>• Enable account recovery options</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-full hover:bg-orange-100 transition-colors"
                title="Dismiss for 24 hours"
              >
                <X className="w-4 h-4 text-orange-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress indicator for limited features */}
      <div className="px-4 pb-4">
        <div className="bg-orange-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: '25%' }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-orange-600">Account setup progress</span>
          <span className="text-xs text-orange-600 font-medium">25% complete</span>
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile or smaller spaces
export function EmailVerificationBannerCompact() {
  const { data: user } = useUser();
  const [isResending, setIsResending] = useState(false);

  const needsVerification = user && !user.email_verified;

  const handleQuickResend = async () => {
    setIsResending(true);
    try {
      await fetch("/api/auth/verification-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      alert("Verification email sent! Please check your inbox.");
    } catch (error) {
      alert("Failed to send email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!needsVerification) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-orange-700">Email not verified</span>
        </div>
        <button
          onClick={handleQuickResend}
          disabled={isResending}
          className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          {isResending ? "Sending..." : "Resend"}
        </button>
      </div>
    </div>
  );
}