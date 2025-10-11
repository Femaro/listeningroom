"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/utils/firebase";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  Heart,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

function MainComponent() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "seeker",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Wait for Firebase to initialize
  useEffect(() => {
    const checkFirebase = setInterval(() => {
      if (auth && db) {
        setFirebaseReady(true);
        clearInterval(checkFirebase);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkFirebase);
      if (!auth || !db) {
        setError("Unable to connect to authentication service. Please refresh the page.");
      }
    }, 10000);

    return () => {
      clearInterval(checkFirebase);
      clearTimeout(timeout);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Check if Firebase is initialized
      if (!auth || !db) {
        throw new Error("Authentication service is not ready. Please refresh the page.");
      }

      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(cred.user, { displayName: formData.name });
      
      // Store activation token expiration in Firestore
      const activationExpiresAt = new Date();
      activationExpiresAt.setHours(activationExpiresAt.getHours() + 24); // 24 hour expiration

      // Create user profile with activation tracking
      await setDoc(doc(db, "users", cred.user.uid), {
        name: formData.name,
        email: formData.email,
        userType: "seeker", // Default for signup page
        emailVerified: false,
        activationEmailSentAt: serverTimestamp(),
        activationExpiresAt: activationExpiresAt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Send email verification
      try {
        const actionCodeSettings = {
          url: window.location.origin + '/dashboard',
          handleCodeInApp: false,
        };
        
        await sendEmailVerification(cred.user, actionCodeSettings);
        console.log('Email verification sent successfully');
      } catch (emailError) {
        console.warn('Email verification failed, but user was created:', emailError);
        // Don't throw the error - user creation was successful
      }
      
      setSuccess("Account created! Please verify your email to continue.");
      setLoading(false);
      
      // Redirect to awaiting activation page (STRICT - no dashboard access)
      setTimeout(() => {
        window.location.href = "/account/awaiting-activation";
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      
      const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 8 characters long.',
        'auth/operation-not-allowed': 'Email sign-up is not enabled. Please contact support.',
        'auth/unauthorized-continue-url': 'Domain not configured. Please try again or contact support.',
        'auth/invalid-continue-url': 'Invalid redirect URL. Please try again.',
        'auth/missing-continue-uri': 'Redirect URL is missing. Please try again.',
        'auth/network-request-failed': 'Network error. Please check your connection and try again.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can't be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

      // Special handling for domain errors
      if (err?.code === 'auth/unauthorized-continue-url') {
        setError("Domain configuration issue. Please try again in a few minutes or contact support if the problem persists.");
      } else {
        setError(errorMessages[err?.code] || err?.message || "Something went wrong. Please try again.");
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <img
            src="https://ucarecdn.com/e05f1122-ee17-479a-b4b8-456584592d00/-/format/auto/"
            alt="Listening Room Logo"
            className="w-40 h-20 mx-auto mb-4 object-contain"
          />
          <p className="text-gray-600 mt-2">Join our supportive community</p>
        </div>

        <form
          noValidate
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Create Account
          </h2>

          <div className="space-y-4">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password (min. 8 characters)"
                  className="pl-10 pr-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to...
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors"
              >
                <option value="seeker">
                  Receive support and connect with listeners
                </option>
                <option value="volunteer">Become a volunteer listener</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || success || !firebaseReady}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {!firebaseReady
                ? "Initializing..."
                : loading
                ? "Creating account..."
                : success
                  ? "Check your email"
                  : "Create Account"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href={`/account/signin${
                  typeof window !== "undefined" ? window.location.search : ""
                }`}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </form>

        {/* Privacy & Safety Notice */}
        <div className="mt-6 space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-teal-800 mb-2">
              🔒 Your Privacy is Protected
            </h3>
            <p className="text-xs text-teal-700">
              All conversations are anonymous and confidential. We never store
              chat content.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-red-800 font-medium">
              Crisis Support Available 24/7
            </p>
            <p className="text-xs text-red-600 mt-1">
              If you're in immediate danger, please call emergency services or
              visit your local emergency room.
            </p>
          </div>

          {/* Support Link */}
          <div className="text-center">
            <a
              href="/donate"
              className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              <Heart className="w-4 h-4" />
              <span>Support our mission</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
