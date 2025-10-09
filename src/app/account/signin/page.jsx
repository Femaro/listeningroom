"use client";

import { useState } from "react";
import { auth, db } from "@/utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Heart, Info, Home, HelpCircle, Shield, ArrowLeft } from "lucide-react";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!cred.user.emailVerified) {
        setError("Please verify your email address before signing in. Check your inbox for a verification email.");
        setLoading(false);
        return;
      }
      
      // Route based on userType stored in Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", cred.user.uid));
        const userType = userDoc.exists() ? userDoc.data()?.userType : undefined;
        if (userType === "volunteer") {
          window.location.href = "/volunteer/dashboard";
          return;
        }
        if (userType === "seeker") {
          window.location.href = "/seeker/dashboard";
          return;
        }
        if (userType === "admin") {
          window.location.href = "/admin/dashboard";
          return;
        }
      } catch {
        // fall through to default redirect
      }
      window.location.href = "/dashboard";
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-in. Please try again or use a different method.",
        OAuthCallback: "Sign-in failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-in method. Try another option.",
        EmailCreateAccount:
          "This email can't be used to create an account. It may already exist.",
        Callback: "Something went wrong during sign-in. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Incorrect email or password. Try again or reset your password.",
        AccessDenied: "You don't have permission to sign in.",
        Configuration:
          "Sign-in isn't working right now. Please try again later.",
        Verification: "Your sign-in link has expired. Request a new one.",
      };

      setError(errorMessages[err?.code] || err?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Page-specific sub-header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-teal-100/50 shadow-sm py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </a>

            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="/"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </a>
              <a
                href="/how-it-works"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>How It Works</span>
              </a>
              <a
                href="/crisis-resources"
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Crisis Help</span>
              </a>
              <a
                href="/donate"
                className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-medium transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Support Us</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <img
              src="https://ucarecdn.com/e05f1122-ee17-479a-b4b8-456584592d00/-/format/auto/"
              alt="Listening Room Logo"
              className="w-40 h-20 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your safe space</p>
          </div>

          <form
            noValidate
            onSubmit={onSubmit}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Sign In
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  required
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  required
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href={`/account/signup${
                    typeof window !== "undefined" ? window.location.search : ""
                  }`}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Sign up
                </a>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <a
                  href="/volunteer/application"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Apply to become a volunteer
                </a>
              </p>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="/how-it-works"
              className="flex items-center justify-center space-x-2 bg-white/70 hover:bg-white rounded-lg p-3 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                How It Works
              </span>
            </a>
            <a
              href="/crisis-resources"
              className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 rounded-lg p-3 transition-colors"
            >
              <Shield className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                Crisis Help
              </span>
            </a>
          </div>

          {/* Support Link */}
          <div className="mt-4 text-center">
            <a
              href="/donate"
              className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              <Heart className="w-4 h-4" />
              <span>Support our mission</span>
            </a>
          </div>

          {/* Crisis Notice */}
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-red-800 font-medium">
              Crisis Support Available 24/7
            </p>
            <p className="text-xs text-red-600 mt-1">
              If you're in immediate danger, please call emergency services or
              visit your local emergency room.
            </p>
            <a
              href="/crisis-resources"
              className="inline-block mt-2 text-xs text-red-700 hover:text-red-800 font-medium underline"
            >
              View all crisis resources →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
