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
      title: "Browse Available Listeners",
      description: "Find a trained volunteer ready to listen",
      image: "https://cdni.iconscout.com/illustration/premium/thumb/people-searching-for-volunteer-illustration-download-in-svg-png-gif-file-formats--volunteers-charity-donation-pack-illustrations-6430447.png",
    },
    {
      number: 2,
      icon: MessageCircle,
      title: "Start a Conversation",
      description: "Connect via voice call or text chat - completely anonymous",
      image: "https://cdni.iconscout.com/illustration/premium/thumb/online-chatting-illustration-download-in-svg-png-gif-file-formats--conversation-messaging-business-communication-pack-illustrations-4713346.png",
    },
    {
      number: 3,
      icon: Shield,
      title: "Safe & Confidential",
      description: "Your privacy is protected - leave anytime you want",
      image: "https://cdni.iconscout.com/illustration/premium/thumb/data-security-illustration-download-in-svg-png-gif-file-formats--privacy-protection-cyber-pack-network-communications-illustrations-4713354.png",
    },
    {
      number: 4,
      icon: Heart,
      title: "You're Ready!",
      description: "Join thousands finding support in our global community",
      image: "https://cdni.iconscout.com/illustration/premium/thumb/global-community-illustration-download-in-svg-png-gif-file-formats--worldwide-network-people-world-connection-pack-illustrations-6430449.png",
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Skip Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-teal-600 font-medium text-sm transition-colors"
          >
            Skip →
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Progress Dots */}
          <div className="flex justify-center items-center space-x-3 pt-8 pb-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step.number === currentStep
                    ? "w-8 bg-gradient-to-r from-cyan-500 to-teal-500"
                    : step.number < currentStep
                    ? "w-2 bg-teal-400"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Illustration */}
          <div className="px-8 pt-4">
            <div className="relative w-full h-64 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl overflow-hidden">
              <img
                src={currentStepData.image}
                alt={currentStepData.title}
                className="w-full h-full object-contain p-8"
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl mb-6">
              <currentStepData.icon className="w-8 h-8 text-teal-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {currentStepData.title}
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>{currentStep === 4 ? "Get Started" : "Next"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {currentStep} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}

