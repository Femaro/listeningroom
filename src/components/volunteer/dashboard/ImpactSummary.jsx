import { Star } from "lucide-react";

export default function ImpactSummary({ stats }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Impact
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Sessions</span>
          <span className="font-medium">
            {stats?.total_sessions || 0}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Hours Volunteered</span>
          <span className="font-medium">
            {stats?.total_hours || 0}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">People Helped</span>
          <span className="font-medium">
            {stats?.total_seekers || 0}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Average Rating</span>
          <span className="font-medium flex items-center">
            <Star className="w-3 h-3 text-yellow-500 mr-1" />
            {stats?.average_rating || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
