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
  Globe,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Languages,
  Calendar,
  ArrowRight,
} from "lucide-react";

export default function VolunteerRegister() {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Account Info
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    
    // Step 2: Location & Availability
    location: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    phone: "",
    
    // Step 3: Languages & Experience
    languages: ["English"],
    hasExperience: "",
    experience: "",
    
    // Step 4: Commitment & Motivation
    hoursPerWeek: "",
    motivation: "",
    agreedToTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleLanguageToggle = (lang) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError("Please enter your full name");
          return false;
        }
        if (!formData.email.trim()) {
          setError("Please enter your email address");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        return true;

      case 2:
        if (!formData.location.trim()) {
          setError("Please enter your location (City, Country)");
          return false;
        }
        return true;

      case 3:
        if (formData.languages.length === 0) {
          setError("Please select at least one language");
          return false;
        }
        return true;

      case 4:
        if (!formData.hoursPerWeek) {
          setError("Please select your time commitment");
          return false;
        }
        if (!formData.motivation.trim()) {
          setError("Please tell us why you want to volunteer");
          return false;
        }
        if (!formData.agreedToTerms) {
          setError("Please agree to the terms and conditions");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if Firebase is initialized
      if (!auth || !db) {
        throw new Error("Authentication service is not ready. Please refresh the page.");
      }

      // Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update display name
      await updateProfile(cred.user, { displayName: formData.name });

      // Store activation token expiration in Firestore
      const activationExpiresAt = new Date();
      activationExpiresAt.setHours(activationExpiresAt.getHours() + 24); // 24 hour expiration

      // Create Firestore user profile with activation tracking
      await setDoc(doc(db, "users", cred.user.uid), {
        name: formData.name,
        email: formData.email,
        userType: "volunteer",
        location: formData.location,
        timezone: formData.timezone,
        phone: formData.phone,
        languages: formData.languages,
        hasExperience: formData.hasExperience,
        experience: formData.experience,
        hoursPerWeek: formData.hoursPerWeek,
        motivation: formData.motivation,
        emailVerified: false,
        activationEmailSentAt: serverTimestamp(),
        activationExpiresAt: activationExpiresAt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Default settings
        emailNotifications: true,
        pushNotifications: true,
        sessionReminders: true,
        emergencyAlerts: true,
        profileVisibility: "public",
        showOnlineStatus: true,
        theme: "system",
        // Volunteer specific
        isApproved: false, // Requires admin approval
        trainingCompleted: false,
        status: "pending", // pending, approved, suspended
      });

      // Send email verification
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/dashboard`,
          handleCodeInApp: false,
        };
        await sendEmailVerification(cred.user, actionCodeSettings);
      } catch (emailError) {
        console.warn("Email verification failed:", emailError);
      }

      // Redirect to awaiting activation page (STRICT - no dashboard access)
      window.location.href = "/account/awaiting-activation";
    } catch (err) {
      console.error("Registration error:", err);
      
      let errorMessage = "Failed to create account. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const availableLanguages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Portuguese",
    "Mandarin",
    "Arabic",
    "Hindi",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-emerald-100/60 mb-6">
            <Heart className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Volunteer Application
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Become a Volunteer Listener
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Join our community of compassionate volunteers making a difference
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[
              { num: 1, label: "Account" },
              { num: 2, label: "Location" },
              { num: 3, label: "Skills" },
              { num: 4, label: "Commitment" },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      currentStep >= step.num
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.num ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 font-medium">
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                      currentStep > step.num ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/60 p-8 sm:p-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                    <User className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
                  <p className="text-gray-600 mt-2">Create your volunteer account</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Re-enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location & Availability */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                    <MapPin className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Location & Contact</h2>
                  <p className="text-gray-600 mt-2">Help us match you with local seekers</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location (City, Country) *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., New York, United States"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You'll be matched with seekers in your country
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Timezone
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    For account recovery and important notifications only
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Languages & Experience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                    <Languages className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Languages & Experience</h2>
                  <p className="text-gray-600 mt-2">Tell us about your skills</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Languages You Speak *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageToggle(lang)}
                        className={`py-3 px-4 rounded-xl font-medium transition-all ${
                          formData.languages.includes(lang)
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Do you have mental health or counseling experience?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: "hasExperience", value: "yes" } })}
                      className={`py-3 px-4 rounded-xl font-medium transition-all ${
                        formData.hasExperience === "yes"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: "hasExperience", value: "no" } })}
                      className={`py-3 px-4 rounded-xl font-medium transition-all ${
                        formData.hasExperience === "no"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      No
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    No experience required - we provide full training!
                  </p>
                </div>

                {formData.hasExperience === "yes" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Please describe your experience (Optional)
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="E.g., Psychology degree, peer counselor, crisis hotline volunteer..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Commitment & Motivation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                    <Calendar className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Commitment & Motivation</h2>
                  <p className="text-gray-600 mt-2">Almost done!</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    How many hours per week can you commit? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["1-2 hours", "3-5 hours", "6-10 hours", "10+ hours"].map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => handleInputChange({ target: { name: "hoursPerWeek", value: hours } })}
                        className={`py-3 px-4 rounded-xl font-medium transition-all ${
                          formData.hoursPerWeek === hours
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {hours}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Why do you want to become a volunteer listener? *
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Share what motivates you to help others..."
                    required
                  />
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      required
                    />
                    <label className="text-sm text-gray-700">
                      I agree to the{" "}
                      <a href="/terms" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/volunteer-code-of-conduct" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
                        Volunteer Code of Conduct
                      </a>
                      . I understand that I will need to complete training before becoming active.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !firebaseReady}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!firebaseReady ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Initializing...</span>
                    </>
                  ) : loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Already have account */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/account/signin" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

