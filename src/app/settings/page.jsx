"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Globe,
  Camera,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Settings as SettingsIcon,
  ArrowLeft,
  Trash2,
  Download,
  Upload,
  Smartphone,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { db } from "@/utils/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { updatePassword, updateEmail, updateProfile, deleteUser as deleteFirebaseUser, reauthenticateWithCredential as reauthFirebase, EmailAuthProvider } from "firebase/auth";

export default function AccountSettings() {
  const { user, userProfile, loading } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: "en",
    phone: "",
    website: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    weeklyDigest: true,
    marketingEmails: false,
    emergencyAlerts: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showOnlineStatus: true,
    allowDirectMessages: true,
    dataSharing: false,
    analyticsTracking: true,
  });

  const [themeSettings, setThemeSettings] = useState({
    theme: "system",
    fontSize: "medium",
    highContrast: false,
  });

  // Load user data
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || "",
        email: user?.email || "",
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        timezone: userProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: userProfile.language || "en",
        phone: userProfile.phone || "",
        website: userProfile.website || "",
      });

      setNotificationSettings({
        emailNotifications: userProfile.emailNotifications ?? true,
        pushNotifications: userProfile.pushNotifications ?? true,
        sessionReminders: userProfile.sessionReminders ?? true,
        weeklyDigest: userProfile.weeklyDigest ?? true,
        marketingEmails: userProfile.marketingEmails ?? false,
        emergencyAlerts: userProfile.emergencyAlerts ?? true,
      });

      setPrivacySettings({
        profileVisibility: userProfile.profileVisibility || "public",
        showOnlineStatus: userProfile.showOnlineStatus ?? true,
        allowDirectMessages: userProfile.allowDirectMessages ?? true,
        dataSharing: userProfile.dataSharing ?? false,
        analyticsTracking: userProfile.analyticsTracking ?? true,
      });

      setThemeSettings({
        theme: userProfile.theme || "system",
        fontSize: userProfile.fontSize || "medium",
        highContrast: userProfile.highContrast ?? false,
      });
    }
  }, [userProfile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.name,
      });

      // Update Firestore profile
      await updateDoc(doc(db, "users", user.uid), {
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        timezone: profileData.timezone,
        language: profileData.language,
        phone: profileData.phone,
        website: profileData.website,
        updatedAt: new Date(),
      });

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords don't match");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthFirebase(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Password updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        setError("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      await updateEmail(user, profileData.email);
      
      await updateDoc(doc(db, "users", user.uid), {
        email: profileData.email,
        updatedAt: new Date(),
      });

      setSuccess("Email updated successfully! Please check your new email for verification.");
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error("Error updating email:", error);
      setError("Failed to update email. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (settingsType) => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      let updateData = { updatedAt: new Date() };

      switch (settingsType) {
        case "notifications":
          updateData = { ...updateData, ...notificationSettings };
          break;
        case "privacy":
          updateData = { ...updateData, ...privacySettings };
          break;
        case "theme":
          updateData = { ...updateData, ...themeSettings };
          break;
      }

      await updateDoc(doc(db, "users", user.uid), updateData);

      setSuccess(`${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings saved!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error(`Error updating ${settingsType}:`, error);
      setError(`Failed to save ${settingsType} settings. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

    setSaving(true);
    setError(null);

    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", user.uid));

      // Delete Firebase Auth user
      await deleteFirebaseUser(user);

      // Redirect to homepage
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("Failed to delete account. Please contact support.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const userData = {
        profile: profileData,
        notifications: notificationSettings,
        privacy: privacySettings,
        theme: themeSettings,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `listening-room-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      setSuccess("Data exported successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error exporting data:", error);
      setError("Failed to export data. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Required</h1>
          <p className="text-gray-300 mb-8 text-lg">Please sign in to access your settings</p>
          <a href="/account/signin" className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-white hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </a>
              <div>
                <h1 className="text-3xl font-bold text-white">Account Settings</h1>
                <p className="text-gray-300 mt-1">Manage your account preferences and privacy</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportData}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Download className="w-4 h-4 mr-2 inline" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-500/20 border border-green-400/30 rounded-xl p-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-300">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-400 hover:text-green-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "security", label: "Security", icon: Lock },
                  { id: "notifications", label: "Notifications", icon: Bell },
                  { id: "privacy", label: "Privacy", icon: Shield },
                  { id: "appearance", label: "Appearance", icon: Monitor },
                  { id: "danger", label: "Danger Zone", icon: AlertCircle },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-teal-500/20 text-teal-300 border border-teal-400/30"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
              {activeTab === "profile" && (
                <ProfileTab
                  profileData={profileData}
                  setProfileData={setProfileData}
                  onSave={handleSaveProfile}
                  saving={saving}
                />
              )}

              {activeTab === "security" && (
                <SecurityTab
                  passwordData={passwordData}
                  setPasswordData={setPasswordData}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showCurrentPassword={showCurrentPassword}
                  setShowCurrentPassword={setShowCurrentPassword}
                  onSavePassword={handleChangePassword}
                  onSaveEmail={handleChangeEmail}
                  saving={saving}
                />
              )}

              {activeTab === "notifications" && (
                <NotificationsTab
                  settings={notificationSettings}
                  setSettings={setNotificationSettings}
                  onSave={() => handleSaveSettings("notifications")}
                  saving={saving}
                />
              )}

              {activeTab === "privacy" && (
                <PrivacyTab
                  settings={privacySettings}
                  setSettings={setPrivacySettings}
                  onSave={() => handleSaveSettings("privacy")}
                  saving={saving}
                />
              )}

              {activeTab === "appearance" && (
                <AppearanceTab
                  settings={themeSettings}
                  setSettings={setThemeSettings}
                  onSave={() => handleSaveSettings("theme")}
                  saving={saving}
                />
              )}

              {activeTab === "danger" && (
                <DangerZoneTab
                  onDeleteAccount={handleDeleteAccount}
                  onExportData={handleExportData}
                  saving={saving}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ profileData, setProfileData, onSave, saving }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Information</h2>
        <p className="text-gray-300">Update your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={profileData.location}
            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={profileData.website}
            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Language
          </label>
          <select
            value={profileData.language}
            onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={profileData.bio}
          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// Security Tab Component
function SecurityTab({
  passwordData,
  setPasswordData,
  showPassword,
  setShowPassword,
  showCurrentPassword,
  setShowCurrentPassword,
  onSavePassword,
  onSaveEmail,
  saving,
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Security Settings</h2>
        <p className="text-gray-300">Manage your password and security preferences</p>
      </div>

      {/* Change Password */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Change Password</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Confirm new password"
          />
        </div>

        <button
          onClick={onSavePassword}
          disabled={saving}
          className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab({ settings, setSettings, onSave, saving }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
        <p className="text-gray-300">Choose how you want to be notified about activities</p>
      </div>

      <div className="space-y-4">
        {[
          { key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email" },
          { key: "pushNotifications", label: "Push Notifications", description: "Receive push notifications in your browser" },
          { key: "sessionReminders", label: "Session Reminders", description: "Get reminded about upcoming sessions" },
          { key: "weeklyDigest", label: "Weekly Digest", description: "Receive a weekly summary of your activity" },
          { key: "marketingEmails", label: "Marketing Emails", description: "Receive promotional content and updates" },
          { key: "emergencyAlerts", label: "Emergency Alerts", description: "Receive critical safety and security alerts" },
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <h3 className="font-medium text-white">{setting.label}</h3>
              <p className="text-sm text-gray-300">{setting.description}</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, [setting.key]: !settings[setting.key] })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[setting.key] ? "bg-teal-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings[setting.key] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// Privacy Tab Component
function PrivacyTab({ settings, setSettings, onSave, saving }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Privacy Settings</h2>
        <p className="text-gray-300">Control your privacy and data sharing preferences</p>
      </div>

      <div className="space-y-4">
        {[
          { key: "profileVisibility", label: "Profile Visibility", description: "Who can see your profile", type: "select", options: [
            { value: "public", label: "Public" },
            { value: "volunteers", label: "Volunteers Only" },
            { value: "private", label: "Private" },
          ]},
          { key: "showOnlineStatus", label: "Show Online Status", description: "Let others see when you're online" },
          { key: "allowDirectMessages", label: "Allow Direct Messages", description: "Allow other users to send you direct messages" },
          { key: "dataSharing", label: "Data Sharing", description: "Share anonymized data to improve the platform" },
          { key: "analyticsTracking", label: "Analytics Tracking", description: "Allow tracking for analytics and improvements" },
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <h3 className="font-medium text-white">{setting.label}</h3>
              <p className="text-sm text-gray-300">{setting.description}</p>
            </div>
            {setting.type === "select" ? (
              <select
                value={settings[setting.key]}
                onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {setting.options.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => setSettings({ ...settings, [setting.key]: !settings[setting.key] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[setting.key] ? "bg-teal-600" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[setting.key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// Appearance Tab Component
function AppearanceTab({ settings, setSettings, onSave, saving }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Appearance Settings</h2>
        <p className="text-gray-300">Customize the look and feel of your experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map((theme) => (
              <button
                key={theme.value}
                onClick={() => setSettings({ ...settings, theme: theme.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.theme === theme.value
                    ? "border-teal-400 bg-teal-500/20"
                    : "border-white/30 bg-white/5 hover:border-white/50"
                }`}
              >
                <theme.icon className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-white font-medium">{theme.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Font Size</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ].map((size) => (
              <button
                key={size.value}
                onClick={() => setSettings({ ...settings, fontSize: size.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.fontSize === size.value
                    ? "border-teal-400 bg-teal-500/20"
                    : "border-white/30 bg-white/5 hover:border-white/50"
                }`}
              >
                <div className="text-white font-medium">{size.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div>
            <h3 className="font-medium text-white">High Contrast Mode</h3>
            <p className="text-sm text-gray-300">Increase contrast for better visibility</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, highContrast: !settings.highContrast })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.highContrast ? "bg-teal-600" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.highContrast ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// Danger Zone Tab Component
function DangerZoneTab({ onDeleteAccount, onExportData, saving }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Danger Zone</h2>
        <p className="text-gray-300">Irreversible and destructive actions</p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-red-500/10 border border-red-400/30 rounded-xl">
          <h3 className="text-lg font-semibold text-red-300 mb-2">Export Your Data</h3>
          <p className="text-red-200 text-sm mb-4">
            Download a copy of all your data before making any changes
          </p>
          <button
            onClick={onExportData}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 inline" />
            Export Data
          </button>
        </div>

        <div className="p-6 bg-red-500/10 border border-red-400/30 rounded-xl">
          <h3 className="text-lg font-semibold text-red-300 mb-2">Delete Account</h3>
          <p className="text-red-200 text-sm mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={onDeleteAccount}
            disabled={saving}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2 inline" />
            {saving ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}