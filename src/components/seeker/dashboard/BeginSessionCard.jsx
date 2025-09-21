"use client";

import { Heart, Loader, CheckCircle, Shield, Play } from "lucide-react";

export default function BeginSessionCard({ onStartSession, isMatching }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ready to talk?
        </h2>
        <p className="text-gray-600 mb-6">
          Connect with a compassionate volunteer listener for free support and
          guidance.
        </p>

        <button
          onClick={onStartSession}
          disabled={isMatching}
          className="w-full bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
        >
          {isMatching ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>Finding you a volunteer...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              <span>Begin Session</span>
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>First 5 minutes free</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>100% confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
}
