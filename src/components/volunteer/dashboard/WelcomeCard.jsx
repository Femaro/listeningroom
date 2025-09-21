import { HeartHandshake } from "lucide-react";

export default function WelcomeCard({ user, isFirstTime }) {
  const firstName = user?.name?.split(" ")[0] || "Volunteer";

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
          <HeartHandshake className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {isFirstTime
              ? `Welcome, ${firstName}! 🎉`
              : `Welcome back, ${firstName}! 👋`}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {isFirstTime
              ? "Thank you for joining our community of compassionate volunteers. Your support makes a real difference."
              : "Ready to make a difference today? Your compassionate listening helps people feel less alone."}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
              💚 Making a difference
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              🛡️ Trusted volunteer
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              🌟 Community hero
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
