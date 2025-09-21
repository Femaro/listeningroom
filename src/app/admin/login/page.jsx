"use client";

import { useState, useEffect } from "react";
import { Shield, User, Lock, ArrowLeft, AlertTriangle } from "lucide-react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { auth, db } from "@/utils/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AdminLogin() {
  const { user, userProfile, loading: authLoading } = useFirebaseAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated as admin
    if (user && userProfile && userProfile.userType === "admin") {
      console.log("User is already authenticated as admin, redirecting...");
      window.location.href = '/admin/dashboard';
    }
  }, [user, userProfile]);

  // Test Firebase connection
  useEffect(() => {
    console.log("Firebase auth object:", auth);
    console.log("Firebase db object:", db);
    console.log("Current user:", user);
    console.log("User profile:", userProfile);
  }, [user, userProfile]);

  const testFirebaseConnection = async () => {
    try {
      console.log("Testing Firebase connection...");
      console.log("Auth object:", auth);
      console.log("DB object:", db);
      
      // Test Firestore connection
      const testDoc = doc(db, "test", "connection");
      await setDoc(testDoc, { test: true, timestamp: serverTimestamp() });
      console.log("Firestore connection successful");
      
      // Test Auth connection
      console.log("Auth current user:", auth.currentUser);
      console.log("Firebase connection test completed successfully");
      
      setError("Firebase connection test successful! Check console for details.");
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      setError(`Firebase connection test failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    // Admin credentials for Listening Room platform
    const adminCredentials = {
      username: "LRAdmin2024",
      password: "ListeningRoom@Admin#2024",
      email: "admin@listeningroom.com"
    };

    if (username === adminCredentials.username && password === adminCredentials.password) {
      try {
        console.log("Starting admin authentication process...");
        
        // First, try to create the admin user (this will work even if user exists)
        try {
          console.log("Creating/updating admin user...");
          const userCredential = await createUserWithEmailAndPassword(auth, adminCredentials.email, password);
          console.log("Admin user created/updated in Firebase Auth");
          
          // Set display name
          await updateProfile(userCredential.user, {
            displayName: "Admin User"
          });
          console.log("Admin display name set");

          // Create/update admin profile in Firestore
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: "Admin User",
            email: adminCredentials.email,
            userType: "admin",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isAdmin: true,
            adminLevel: "super",
            permissions: ["all"]
          }, { merge: true });
          console.log("Admin profile created/updated in Firestore");
          
        } catch (createError) {
          // If user already exists, try to sign in
          if (createError.code === 'auth/email-already-in-use') {
            console.log("Admin user already exists, signing in...");
            try {
              await signInWithEmailAndPassword(auth, adminCredentials.email, password);
              console.log("Successfully signed in with existing admin account");
            } catch (signInError) {
              console.error("Sign in failed:", signInError);
              throw signInError;
            }
          } else {
            console.error("Create user failed:", createError);
            throw createError;
          }
        }

        console.log("Admin authentication successful, redirecting...");
        setError(""); // Clear any previous errors
        setLoading(false);
        
        // Show success message
        alert("Admin authentication successful! Redirecting to dashboard...");
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 2000);
        
      } catch (error) {
        console.error("Admin authentication error:", error);
        console.error("Error details:", error.code, error.message);
        
        // Provide more specific error messages
        let errorMessage = "Failed to authenticate admin. Please try again.";
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = "Admin account already exists. Please try signing in.";
        } else if (error.code === 'auth/weak-password') {
          errorMessage = "Password is too weak. Please contact support.";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "Invalid email format.";
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = "Email/password accounts are not enabled. Please contact support.";
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = "Incorrect password. Please check the credentials below.";
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = "Admin account not found. Please contact support.";
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    } else {
      setError("Invalid admin credentials. Please check the credentials below.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </a>
            
            <div className="flex items-center space-x-2 text-white">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Admin Access</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-400">
              Secure administrative access to Listening Room
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              Administrator Login
            </h2>

            {/* Admin Credentials Display */}
            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
              <div className="text-center mb-3">
                <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-blue-300">Admin Credentials</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Username:</span>
                  <code className="bg-blue-600/30 text-blue-100 px-2 py-1 rounded text-xs font-mono">
                    LRAdmin2024
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Password:</span>
                  <code className="bg-blue-600/30 text-blue-100 px-2 py-1 rounded text-xs font-mono">
                    ListeningRoom@Admin#2024
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Email:</span>
                  <code className="bg-blue-600/30 text-blue-100 px-2 py-1 rounded text-xs font-mono">
                    admin@listeningroom.com
                  </code>
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-300 text-center">
                Use these credentials to access the admin dashboard
              </div>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={testFirebaseConnection}
                  className="text-xs bg-blue-600/30 text-blue-200 px-3 py-1 rounded hover:bg-blue-600/50 transition-colors"
                >
                  Test Firebase Connection
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-200 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Demo Credentials
                </h3>
                <div className="text-xs text-blue-100 space-y-1 font-mono">
                  <p><span className="text-blue-300">Username:</span> LRAdmin</p>
                  <p><span className="text-blue-300">Password:</span> AdminPass123*</p>
                </div>
              </div>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              This is a secure administrative area. All access is logged and monitored.
            </p>
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>
    </div>
  );
}