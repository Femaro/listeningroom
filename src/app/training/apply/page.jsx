"use client";

import { useState } from "react";
import {
  BookOpen,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Heart,
  Users,
  Award,
  Shield,
  Headphones,
  Star,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Globe,
  User,
  FileText,
} from "lucide-react";

export default function TrainingApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    timezone: "",
    
    // Background
    background: "",
    experience: "",
    motivation: "",
    
    // Availability
    availability: [],
    preferredLanguages: ["English"],
    
    // Training Preferences
    trainingGoals: [],
    specializations: [],
    
    // Agreements
    agreeToTerms: false,
    agreeToTraining: false,
    agreeToBackground: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const languages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Dutch", "Russian", "Chinese", "Japanese", "Korean", "Arabic", 
    "Hindi", "Other"
  ];

  const specializations = [
    "General Listening", "Anxiety Support", "Depression Support", 
    "Grief Counseling", "Relationship Issues", "Work Stress", 
    "Academic Pressure", "Family Issues", "LGBTQ+ Support",
    "Mental Health Awareness", "Crisis Support", "Addiction Support"
  ];

  const trainingGoals = [
    "Learn active listening skills",
    "Understand crisis intervention",
    "Develop empathy and compassion",
    "Build professional boundaries",
    "Gain confidence in helping others",
    "Connect with like-minded volunteers"
  ];

  const timezones = [
    "UTC-12:00 (Baker Island)", "UTC-11:00 (American Samoa)", "UTC-10:00 (Hawaii)",
    "UTC-09:00 (Alaska)", "UTC-08:00 (Pacific)", "UTC-07:00 (Mountain)",
    "UTC-06:00 (Central)", "UTC-05:00 (Eastern)", "UTC-04:00 (Atlantic)",
    "UTC-03:00 (Brazil)", "UTC-02:00 (Mid-Atlantic)", "UTC-01:00 (Azores)",
    "UTC+00:00 (GMT)", "UTC+01:00 (CET)", "UTC+02:00 (EET)",
    "UTC+03:00 (MSK)", "UTC+04:00 (GST)", "UTC+05:00 (PKT)",
    "UTC+06:00 (BST)", "UTC+07:00 (ICT)", "UTC+08:00 (CST)",
    "UTC+09:00 (JST)", "UTC+10:00 (AEST)", "UTC+11:00 (SBT)",
    "UTC+12:00 (NZST)"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/training-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Application Submitted!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Thank you for your interest in our volunteer training program. 
              We'll review your application and get back to you within 2-3 business days.
            </p>
            <div className="mt-8 space-y-4">
              <a
                href="/volunteer/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </a>
              <a
                href="/training"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Learn More About Training
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img
                  src="https://ucarecdn.com/dc54868d-20c4-46fa-b583-6f27b18e95b5/-/format/auto/"
                  alt="ListeningRoom Logo"
                  className="h-8 w-auto"
                />
              </a>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600">Home</a>
              <a href="/training" className="text-gray-600 hover:text-blue-600">Training</a>
              <a href="/volunteer" className="text-gray-600 hover:text-blue-600">Volunteer</a>
              <a href="/contact" className="text-gray-600 hover:text-blue-600">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Background</span>
            <span>Training Goals</span>
            <span>Review</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone *
                  </label>
                  <select
                    required
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your timezone</option>
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Background & Experience */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Background & Experience
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Background *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.background}
                    onChange={(e) => handleInputChange('background', e.target.value)}
                    placeholder="Tell us about your professional background, education, or relevant experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Volunteer Experience
                  </label>
                  <textarea
                    rows={4}
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Describe any previous volunteer work, especially in mental health or support services..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to become a volunteer? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    placeholder="Share your motivation for wanting to help others and what you hope to gain from this experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Training Goals & Preferences */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                Training Goals & Preferences
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What do you hope to learn from our training program? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trainingGoals.map((goal) => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.trainingGoals.includes(goal)}
                          onChange={() => handleArrayChange('trainingGoals', goal)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Areas of Support Interest (training will be provided)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {specializations.map((spec) => (
                      <label key={spec} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.specializations.includes(spec)}
                          onChange={() => handleArrayChange('specializations', spec)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Languages *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {languages.map((lang) => (
                      <label key={lang} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferredLanguages.includes(lang)}
                          onChange={() => handleArrayChange('preferredLanguages', lang)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Agreements */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                Review & Agreements
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Application Summary</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Location:</strong> {formData.city}, {formData.country}</p>
                    <p><strong>Timezone:</strong> {formData.timezone}</p>
                    <p><strong>Training Goals:</strong> {formData.trainingGoals.join(', ')}</p>
                    <p><strong>Specializations:</strong> {formData.specializations.join(', ')}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> *
                    </span>
                  </label>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agreeToTraining}
                      onChange={(e) => handleInputChange('agreeToTraining', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I understand that completing the training program is required before I can begin volunteering *
                    </span>
                  </label>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agreeToBackground}
                      onChange={(e) => handleInputChange('agreeToBackground', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I consent to a background check as part of the volunteer application process *
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
