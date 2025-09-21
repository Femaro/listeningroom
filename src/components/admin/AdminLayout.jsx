"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children, activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <div className={`
        flex-1 transition-all duration-300
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-0'}
      `}>
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
