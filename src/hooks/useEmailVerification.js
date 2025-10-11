"use client";

import { useEffect } from "react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";

/**
 * Hook to enforce email verification for protected routes
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether email verification is required (default: true)
 * @param {string} options.redirectTo - Where to redirect if not verified (default: '/account/awaiting-activation')
 * @param {boolean} options.blockUnverified - Whether to block access for unverified users (default: true)
 * @returns {Object} - { isVerified, loading, user }
 */
export function useEmailVerification(options = {}) {
  const {
    required = true,
    redirectTo = '/account/awaiting-activation',
    blockUnverified = true
  } = options;

  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    if (loading) return;

    // No user - redirect to sign in
    if (!user) {
      if (blockUnverified) {
        window.location.href = "/account/signin";
      }
      return;
    }

    // User exists but email not verified
    if (required && !user.emailVerified) {
      if (blockUnverified) {
        window.location.href = redirectTo;
      }
    }
  }, [user, loading, required, redirectTo, blockUnverified]);

  return {
    isVerified: user?.emailVerified || false,
    loading,
    user,
  };
}

export default useEmailVerification;

