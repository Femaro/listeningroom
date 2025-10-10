"use client";

import { useState } from "react";
import {
  Heart,
  Search,
  MessageCircle,
  Shield,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Lock,
  Phone,
} from "lucide-react";

export default function SeekerGetStarted() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      number: 1,
      icon: Search,
      title: "Find Support When You Need It",
      subtitle: "Browse available volunteer listeners",
      content: [
        "View real-time available sessions from trained volunteer listeners",
        "Choose between voice calls or text chat based on your comfort level",
        "Filter by language, topic, or availability",
        "All volunteers are trained in active listening and empathy",
      ],
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=500&fit=crop",
    },
    {
      number: 2,
      icon: MessageCircle,
      title: "Connect & Share Safely",
      subtitle: "Anonymous, confidential conversations",
      content: [
        "Join a session with just one click - no personal info required",
        "Your identity remains completely anonymous",
        "All conversations are private and confidential",
        "Leave anytime you feel uncomfortable - no questions asked",
      ],
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=500&fit=crop",
    },
    {
      number: 3,
      icon: Shield,
      title: "Your Safety is Our Priority",
      subtitle: "Protected & supported environment",
      content: [
        "Report any inappropriate behavior with one click",
        "Access crisis resources 24/7 if you need emergency help",
        "Our volunteers are trained in crisis recognition",
        "We monitor sessions to ensure community guidelines are followed",
      ],
      image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&h=500&fit=crop",
    },
    {
      number: 4,
      icon: Heart,
      title: "You're Not Alone",
      subtitle: "A global community ready to listen",
      content: [
        "Join a community of thousands who've found support here",
        "Available 24/7 across 40+ countries worldwide",
        "Free peer support - your first 5 minutes always free",
        "Remember: We provide peer support, not professional therapy",
      ],
      image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&h=500&fit=crop",
    },
  ];

  const currentStepData = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - go to dashboard
      window.location.href = "/seeker/dashboard";
    }
  };

  const handleSkip = () => {
    window.location.href = "/seeker/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-teal-600 font-medium transition-colors"
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
                      ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white scale-110 shadow-lg"
                      : step.number < currentStep
                      ? "bg-teal-500 text-white"
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
                      step.number < currentStep ? "bg-teal-500" : "bg-gray-300"
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
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/60 overflow-hidden">
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
                  <currentStepData.icon className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {currentStepData.title}
                  </h2>
                  <p className="text-teal-100 text-lg">{currentStepData.subtitle}</p>
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
                  className="flex items-start space-x-4 bg-teal-50 rounded-2xl p-4 hover:bg-teal-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mt-0.5">
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
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>{currentStep === 4 ? "Go to Dashboard" : "Next"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="bg-white border-2 border-teal-300 text-teal-700 px-8 py-4 rounded-2xl font-bold hover:bg-teal-50 transition-all duration-300"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        {currentStep === 4 && (
          <div className="mt-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Users className="w-6 h-6 mr-3" />
              Ready to start?
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4">
                <Clock className="w-8 h-8 mb-2" />
                <p className="font-semibold mb-1">24/7 Available</p>
                <p className="text-sm text-teal-50">Support anytime, anywhere</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4">
                <Lock className="w-8 h-8 mb-2" />
                <p className="font-semibold mb-1">100% Anonymous</p>
                <p className="text-sm text-teal-50">Your privacy protected</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4">
                <Heart className="w-8 h-8 mb-2" />
                <p className="font-semibold mb-1">Free Support</p>
                <p className="text-sm text-teal-50">First 5 minutes free</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

