"use client";

import { useState } from "react";
import { Heart, DollarSign, CreditCard, Shield, CheckCircle, ArrowLeft } from "lucide-react";
// Payment integration will be added later

export default function DonatePage() {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount("");
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value) {
      setAmount(parseFloat(value) || 0);
    }
  };

  const handleDonate = () => {
    if (amount <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    if (!isAnonymous && (!donorName || !donorEmail)) {
      alert("Please provide your name and email for the donation receipt");
      return;
    }

    // Payment integration will be added later
    alert(`Thank you for your donation of $${amount}! Payment integration will be available soon.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Heart className="w-5 h-5 mr-2" />
                Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Our Mission</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us provide mental health support to those who need it most. 
            Your donation makes a real difference in people's lives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Make a Donation</h2>
            
            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Amount
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {presetAmounts.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    onClick={() => handleAmountSelect(presetAmount)}
                    className={`p-3 border rounded-lg text-center font-medium transition-colors ${
                      amount === presetAmount && !customAmount
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    ${presetAmount}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={handleCustomAmount}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Donor Information */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Make this donation anonymous
                </label>
              </div>

              {!isAnonymous && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center"
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate ${amount}
            </button>
          </div>

          {/* Impact Information */}
          <div className="space-y-6">
            {/* Impact Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">$25 provides</span>
                  <span className="font-semibold text-teal-600">1 hour of support</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">$100 provides</span>
                  <span className="font-semibold text-teal-600">4 hours of support</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">$500 provides</span>
                  <span className="font-semibold text-teal-600">20 hours of support</span>
                </div>
              </div>
            </div>

            {/* Security & Trust */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure & Trusted</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-600">SSL encrypted payments</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Tax-deductible receipts</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Multiple payment methods</span>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-teal-100">
                We believe everyone deserves access to mental health support. 
                Your donation helps us provide free, confidential, and compassionate 
                support to people in crisis, 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment integration will be added later */}
    </div>
  );
}