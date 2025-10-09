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
      color: "teal",
    },
    {
      title: "Book a Session",
      description: "Schedule time with a specific volunteer",
      icon: Calendar,
      href: "/sessions/book",
      color: "cyan",
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
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/60 p-6">
      <h3 className="text-xl font-bold mb-4">
        <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
          Quick Actions
        </span>
      </h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const colorClasses = {
            red: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
            gray: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200",
            green:
              "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
            teal: "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200",
            cyan: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200",
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
