"use client";

import { useState } from "react";
import {
  Heart,
  Plus,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Award,
  Clock,
  Headphones,
  BookOpen,
} from "lucide-react";

export default function VolunteerGetStarted() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      number: 1,
      icon: Plus,
      title: "Create Your Support Sessions",
      subtitle: "Set up sessions for seekers to join",
      content: [
        "Choose between voice or text chat sessions",
        "Set your availability and session duration",
        "Make sessions public or private (invite-only)",
        "Sessions are matched with seekers in your country automatically",
      ],
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop",
    },
    {
      number: 2,
      icon: Headphones,
      title: "Listen with Empathy",
      subtitle: "Provide compassionate peer support",
      content: [
        "Use your training in active listening and empathy",
        "Create a safe, non-judgmental space for seekers",
        "Remember: You're a peer listener, not a therapist",
        "Focus on listening and validating feelings, not giving advice",
      ],
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=500&fit=crop",
    },
    {
      number: 3,
      icon: Shield,
      title: "Maintain Safety & Boundaries",
      subtitle: "Protect yourself and seekers",
      content: [
        "Follow our community guidelines and code of conduct",
        "Recognize crisis situations and escalate when needed",
        "Keep all conversations confidential and anonymous",
        "Take breaks when you feel overwhelmed - self-care is essential",
      ],
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=500&fit=crop",
    },
    {
      number: 4,
      icon: Award,
      title: "Make a Real Difference",
      subtitle: "Change lives through listening",
      content: [
        "Your compassion helps people feel heard and valued",
        "Track your impact through session stats and feedback",
        "Access ongoing training and support resources",
        "Join a community of volunteers making a global impact",
      ],
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=500&fit=crop",
    },
  ];

  const currentStepData = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - go to dashboard
      window.location.href = "/volunteer/dashboard";
    }
  };

  const handleSkip = () => {
    window.location.href = "/volunteer/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
          >
            Skip tutorial →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step.number === currentStep
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white scale-110 shadow-lg"
                      : step.number < currentStep
                      ? "bg-emerald-500 text-white"
                      : "bg-white/50 text-gray-400 border-2 border-gray-300"
                  }`}
                >
                  {step.number < currentStep ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                {step.number < 4 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-1 transition-all duration-300 ${
                      step.number < currentStep ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Step {currentStep} of 4: {currentStepData.subtitle}
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/60 overflow-hidden">
          {/* Image Section */}
          <div className="relative h-64 sm:h-80 overflow-hidden">
            <img
              src={currentStepData.image}
              alt={currentStepData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-white/95 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg">
                  <currentStepData.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {currentStepData.title}
                  </h2>
                  <p className="text-emerald-100 text-lg">{currentStepData.subtitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 sm:p-12">
            <div className="space-y-4 mb-8">
              {currentStepData.content.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 bg-emerald-50 rounded-2xl p-4 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>{currentStep === 4 ? "Go to Dashboard" : "Next"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="bg-white border-2 border-emerald-300 text-emerald-700 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all duration-300"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        {currentStep === 4 && (
          <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Heart className="w-6 h-6 mr-3" />
              Ready to make a difference?
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4">
                <Plus className="w-8 h-8 mb-2" />
                <p className="font-semibold mb-1">Create Sessions</p>
                <p className="text-sm text-emerald-50">Set your availability</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4">
                <BookOpen className="w-8 h-8 mb-2" />
                <p className="font-semibold mb-1">Training Access</p>
                <p className="text-sm text-emerald-50">Ongoing resources</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4">
                <Users className="w-8 h-8 mb-2" />
                <p className="font-semibold mb-1">Global Impact</p>
                <p className="text-sm text-emerald-50">Help people worldwide</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

