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
      title: "Create Support Sessions",
      description: "Set up voice or chat sessions for people who need to talk",
      image: "https://cdni.iconscout.com/illustration/premium/thumb/man-creating-schedule-illustration-download-in-svg-png-gif-file-formats--planning-calendar-time-management-pack-business-illustrations-4713357.png",
    },
    {
      number: 2,
      icon: Headphones,
      title: "Listen with Compassion",
      description: "Provide empathy and support - you're a peer listener, not a therapist",
      image: "https://cdni.iconscout.com/illustration/premium/thumb/customer-support-illustration-download-in-svg-png-gif-file-formats--service-help-desk-call-center-pack-business-illustrations-4713350.png",
    },
    {
      number: 3,
      icon: Shield,
      title: "Stay Safe & Set Boundaries",
      description: "Practice self-care and follow safety guidelines",
      image: "https://cdni.iconscout.com/illustration/premium/thumb/personal-security-illustration-download-in-svg-png-gif-file-formats--data-protection-safety-pack-network-communications-illustrations-4713352.png",
    },
    {
      number: 4,
      icon: Award,
      title: "Make an Impact!",
      description: "Join 500+ volunteers changing lives through listening",
      image: "https://cdni.iconscout.com/illustration/premium/thumb/team-celebrating-achievement-illustration-download-in-svg-png-gif-file-formats--success-teamwork-celebration-pack-business-illustrations-4713348.png",
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Skip Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-emerald-600 font-medium text-sm transition-colors"
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
                    ? "w-8 bg-gradient-to-r from-emerald-500 to-teal-500"
                    : step.number < currentStep
                    ? "w-2 bg-emerald-400"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Illustration */}
          <div className="px-8 pt-4">
            <div className="relative w-full h-64 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl overflow-hidden">
              <img
                src={currentStepData.image}
                alt={currentStepData.title}
                className="w-full h-full object-contain p-8"
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-6">
              <currentStepData.icon className="w-8 h-8 text-emerald-600" />
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
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>{currentStep === 4 ? "Get Started" : "Next"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Step Counter Text */}
        <p className="text-center mt-6 text-sm text-gray-600">
          {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  );
}

