"use client";

import { useState } from "react";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/utils/firebase";
import {
  Home,
  Plus,
  Shield,
  HelpCircle,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Gift,
} from "lucide-react";

export default function NavigationHeader({
  user,
  onSettingsClick,
  onHelpClick,
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Redirect to homepage after successful sign out
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect to homepage even if there's an error
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Dashboard Sub-Navigation */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-teal-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Dashboard Title */}
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                <Home className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Volunteer Dashboard
              </h2>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <a
                href="/volunteer/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-teal-600 bg-teal-50 rounded-lg font-medium"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </a>
              <a
                href="/volunteer/sessions/create"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Session</span>
              </a>
              <a
                href="/training"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Training</span>
              </a>
              <button
                onClick={onHelpClick}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </button>
            </nav>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || "V"}
                    </span>
                  </div>
                  <span className="font-medium">
                    {user?.name || "Volunteer"}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-900 font-medium">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Account Settings
                    </a>
                    <a
                      href="/rewards"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Rewards & Earnings
                    </a>
                    <a
                      href="/donate"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Support Platform
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2">
                <a
                  href="/volunteer/dashboard"
                  className="flex items-center space-x-3 px-4 py-3 text-teal-600 bg-teal-50 rounded-lg font-medium"
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <a
                  href="/volunteer/sessions/create"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Session</span>
                </a>
                <a
                  href="/training"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Shield className="w-5 h-5" />
                  <span>Training</span>
                </a>
                <button
                  onClick={() => {
                    onHelpClick();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg w-full text-left"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Help & Support</span>
                </button>
                <a
                  href="/rewards"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Gift className="w-5 h-5" />
                  <span>Rewards & Earnings</span>
                </a>
                <hr className="my-4" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
