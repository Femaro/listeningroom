"use client";

import { 
  BarChart3,
  Calendar,
  Users,
  BookOpen,
  FileText,
  Video,
  Shield,
  Bell,
  Terminal,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed 
}) {
  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "users", label: "Users", icon: Users },
    { id: "training", label: "Training", icon: BookOpen },
    { id: "training-applications", label: "Applications", icon: FileText },
    { id: "video-management", label: "Videos", icon: Video },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "logs", label: "System Logs", icon: Terminal },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-300 shadow-lg z-50 transition-all duration-300
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-64'}
        lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Listening Room</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <X className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 font-medium
                  ${isActive 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300 shadow-sm' 
                    : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-300">
          <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium">
            <LogOut className="w-5 h-5 text-gray-600" />
            {!isCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
}