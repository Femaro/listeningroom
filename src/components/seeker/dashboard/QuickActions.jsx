"use client";

import { AlertCircle, Calendar, History, Gift, ArrowRight, MessageCircle } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Crisis Resources",
      description: "Immediate help and emergency contacts",
      icon: AlertCircle,
      href: "/crisis-resources",
      color: "red",
      urgent: true,
    },
    {
      title: "Browse Sessions",
      description: "Join live voice or chat sessions with volunteers",
      icon: MessageCircle,
      href: "/seeker/sessions",
      color: "blue",
    },
    {
      title: "Book a Session",
      description: "Schedule time with a specific volunteer",
      icon: Calendar,
      href: "/sessions/book",
      color: "purple",
    },
    {
      title: "My Sessions",
      description: "View past conversations and feedback",
      icon: History,
      href: "/sessions",
      color: "gray",
    },
    {
      title: "Support Platform",
      description: "Help keep this service free for everyone",
      icon: Gift,
      href: "/donate",
      color: "green",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const colorClasses = {
            red: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
            gray: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200",
            green:
              "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
            blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
            purple: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
          };

          return (
            <a
              key={action.title}
              href={action.href}
              className={`block p-4 rounded-lg border transition-colors ${colorClasses[action.color]} ${action.urgent ? "ring-2 ring-red-300" : ""}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">
                    {action.title}
                    {action.urgent && (
                      <span className="ml-1 text-xs">(24/7)</span>
                    )}
                  </h4>
                  <p className="text-xs opacity-75 mt-1">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto flex-shrink-0" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
