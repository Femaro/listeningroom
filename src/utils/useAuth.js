import { useCallback } from "react";
import { signIn, signOut } from "@auth/create/react";

function useAuth() {
  const callbackUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl")
      : null;

  const signInWithCredentials = useCallback(
    async (options) => {
      try {
        const result = await signIn("credentials-signin", {
          ...options,
          callbackUrl: callbackUrl ?? options.callbackUrl,
          redirect: options.redirect ?? true,
        });
        return result;
      } catch (error) {
        console.error("Sign in error:", error);
        throw error;
      }
    },
    [callbackUrl],
  );

  const signUpWithCredentials = useCallback(async (options) => {
    try {
      // For signup, we use the registration API first
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: options.name,
          email: options.email,
          password: options.password,
          userType: options.userType || "seeker",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(
    async (options) => {
      try {
        const result = await signIn("google", {
          ...options,
          callbackUrl: callbackUrl ?? options.callbackUrl,
        });
        return result;
      } catch (error) {
        console.error("Google sign in error:", error);
        throw error;
      }
    },
    [callbackUrl],
  );

  const signInWithFacebook = useCallback(async (options) => {
    try {
      const result = await signIn("facebook", options);
      return result;
    } catch (error) {
      console.error("Facebook sign in error:", error);
      throw error;
    }
  }, []);

  const signInWithTwitter = useCallback(async (options) => {
    try {
      const result = await signIn("twitter", options);
      return result;
    } catch (error) {
      console.error("Twitter sign in error:", error);
      throw error;
    }
  }, []);

  const handleSignOut = useCallback(async (options) => {
    try {
      const result = await signOut({
        ...options,
        callbackUrl: options?.callbackUrl || "/",
      });
      return result;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut: handleSignOut,
  };
}

export default useAuth;
