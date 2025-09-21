"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function WelcomeCard({ user }) {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const firstName = user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    // Check if this is a first-time login
    const hasVisitedBefore = localStorage.getItem(
      `seeker_visited_before_${user?.id}`,
    );
    if (!hasVisitedBefore && user) {
      setIsFirstTime(true);
      localStorage.setItem(`seeker_visited_before_${user.id}`, "true");
    }
  }, [user]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {isFirstTime
              ? `Welcome, ${firstName}! 🎉`
              : `Welcome back, ${firstName}! 👋`}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {isFirstTime
              ? "Welcome to your safe space! We're here to provide compassionate listening and support whenever you need it."
              : "You're in a safe space where someone is always ready to listen. How are you feeling today?"}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              😊 Great
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              😐 Okay
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              😟 Struggling
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              😢 Need help
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
