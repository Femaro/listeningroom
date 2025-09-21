import { Plus, Shield, Gift, HelpCircle } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Create Session",
      description: "Schedule a new session for seekers to book",
      icon: Plus,
      href: "/volunteer/sessions/create",
      color: "green",
    },
    {
      title: "Training Modules",
      description: "Complete required training and certifications",
      icon: Shield,
      href: "/training",
      color: "blue",
    },
    {
      title: "Rewards & Earnings",
      description: "View your points and payment history",
      icon: Gift,
      href: "/rewards",
      color: "purple",
    },
    {
      title: "Volunteer Guide",
      description: "Best practices and guidelines",
      icon: HelpCircle,
      href: "/volunteer-guide",
      color: "gray",
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
            green:
              "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
            blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
            purple:
              "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
            gray: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200",
          };

          return (
            <a
              key={action.title}
              href={action.href}
              className={`block p-4 rounded-lg border transition-colors ${colorClasses[action.color]}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">{action.title}</h4>
                  <p className="text-xs opacity-75 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
