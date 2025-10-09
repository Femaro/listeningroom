"use client";

import { useState } from "react";
import { 
  BookOpen, Home, Plus, Calendar, Users, Settings, Mic, MessageCircle,
  Shield, Play, Check, Bell, Clock, Video, Moon, Sun, ChevronDown, ChevronRight,
  AlertCircle, HelpCircle, Monitor, Smartphone, Globe, Heart
} from "lucide-react";

export default function Documentation() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [userType, setUserType] = useState("all"); // all, seeker, volunteer

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Home,
      for: "all",
      items: [
        {
          title: "Creating Your Account",
          steps: [
            "Visit the homepage and click 'Get Started' or 'Sign Up'",
            "Choose your role: Seeker (need support) or Volunteer (provide support)",
            "Fill in your basic information: name, email, and password",
            "Verify your email address by clicking the link sent to your inbox",
            "Complete your profile setup including location and preferences"
          ]
        },
        {
          title: "Setting Up Your Profile",
          steps: [
            "Navigate to Account Settings from the dashboard",
            "Add your display name (can be anonymous or real name)",
            "Select your country and timezone",
            "Set your language preferences",
            "Configure notification settings",
            "Review and accept platform guidelines"
          ]
        }
      ]
    },
    {
      id: "volunteer-sessions",
      title: "For Volunteers: Creating & Managing Sessions",
      icon: Plus,
      for: "volunteer",
      items: [
        {
          title: "Creating a New Session",
          steps: [
            "Go to your Volunteer Dashboard",
            "Click the 'Create Session' button or navigate to 'Create Session' tab",
            "Choose session type: Voice Call or Text Chat",
            "Enter session title (e.g., 'Open conversation about anxiety')",
            "Set session duration (15, 30, 45, or 60 minutes)",
            "Choose session visibility: Public (anyone can join) or Private (invite only)",
            "Set maximum participants (typically 1-2 for one-on-one support)",
            "Add optional tags/topics (e.g., anxiety, depression, relationships)",
            "Click 'Create Session' to publish",
            "Your session will appear in the 'Available Sessions' list for seekers in your country"
          ]
        },
        {
          title: "Becoming Online & Available",
          steps: [
            "On your dashboard, locate the 'Availability Status' toggle",
            "Click to switch from 'Offline' to 'Online & Available'",
            "When online, your profile appears in the volunteer list",
            "Seekers in your country can see you're available",
            "You'll receive notifications when seekers join your sessions",
            "Remember to set yourself to 'Offline' when taking a break"
          ]
        },
        {
          title: "Managing Active Sessions",
          steps: [
            "Active sessions appear in the 'Active Sessions' section of your dashboard",
            "Click on a session to view participants and session details",
            "Use the session controls: Mute, Video (if applicable), End Session",
            "Monitor session time remaining in the top bar",
            "You can send messages in the chat panel during voice sessions",
            "To end a session early, click 'End Session' and confirm"
          ]
        },
        {
          title: "Scheduling Future Sessions",
          steps: [
            "Navigate to 'Create Session' and select 'Scheduled Session'",
            "Choose a date and time for the session",
            "Fill in session details as you would for an immediate session",
            "Click 'Schedule Session'",
            "Scheduled sessions appear in your 'Upcoming Sessions' list",
            "You'll receive a notification 15 minutes before the scheduled time",
            "To cancel or reschedule, go to 'Upcoming Sessions' and click 'Edit' or 'Cancel'"
          ]
        }
      ]
    },
    {
      id: "seeker-sessions",
      title: "For Seekers: Finding & Joining Sessions",
      icon: Play,
      for: "seeker",
      items: [
        {
          title: "Browsing Available Sessions",
          steps: [
            "Go to your Seeker Dashboard",
            "View available sessions in the 'Available Sessions' card",
            "Click 'Browse Sessions' to see all available sessions from volunteers in your country",
            "Use filters to find sessions by: Session Type (voice/chat), Topic, or Language",
            "Use the search bar to find specific types of support",
            "Sessions are sorted by newest first"
          ]
        },
        {
          title: "Joining a Live Session",
          steps: [
            "Find a session that interests you",
            "Click the 'Join Session' button",
            "Read the session guidelines and click 'Confirm'",
            "For voice sessions: Allow microphone access when prompted",
            "Wait for the volunteer to acknowledge your presence",
            "Use the chat or voice controls to participate",
            "You can leave at any time by clicking 'Leave Session'"
          ]
        },
        {
          title: "Booking a Scheduled Session",
          steps: [
            "Go to 'Book a Session' from your dashboard or navigation",
            "Browse upcoming scheduled sessions from volunteers in your country",
            "Find a session that fits your schedule",
            "Click 'Book This Session'",
            "Confirm your booking",
            "You'll receive a confirmation and a reminder 15 minutes before the session",
            "Access booked sessions from 'My Sessions' on your dashboard"
          ]
        },
        {
          title: "Managing Your Session History",
          steps: [
            "Click 'My Sessions' in the navigation or dashboard",
            "View all your past sessions",
            "See session duration, volunteer name, and date",
            "Rate your experience (optional but helpful)",
            "Access session notes if the volunteer provided any",
            "Download session summaries if available"
          ]
        }
      ]
    },
    {
      id: "session-tools",
      title: "Tools & Features During Sessions",
      icon: Settings,
      for: "all",
      items: [
        {
          title: "Voice Session Controls",
          steps: [
            "Mute/Unmute: Click the microphone icon to mute or unmute yourself",
            "Volume Control: Adjust the volume slider to change audio levels",
            "Leave Session: Click the red 'Leave' or 'End Session' button",
            "Chat Panel: Click the chat icon to open the text chat sidebar",
            "Participants List: View who's in the session on the right panel",
            "Report Issue: Click the shield icon to report inappropriate behavior"
          ]
        },
        {
          title: "Chat Session Features",
          steps: [
            "Type your message in the text box at the bottom",
            "Press Enter or click Send to submit",
            "Messages appear in real-time",
            "Scroll up to view message history",
            "Use the formatting tools for emphasis (if available)",
            "Click the information icon to see session details"
          ]
        },
        {
          title: "Dark/Light Theme Toggle",
          steps: [
            "Look for the theme toggle button (sun/moon icon) in the session room header",
            "Click to switch between light and dark mode",
            "Your preference is saved automatically",
            "Dark mode is easier on the eyes in low-light environments",
            "Light mode provides better visibility in bright settings"
          ]
        },
        {
          title: "Safety Features",
          steps: [
            "Report Button: Available in all sessions to report concerns",
            "Block User: Prevent specific users from joining your future sessions (volunteers)",
            "Emergency Exit: Leave any session instantly without explanation",
            "Crisis Resources: Access the shield icon for immediate crisis helplines",
            "All sessions are monitored for safety and compliance"
          ]
        }
      ]
    },
    {
      id: "dashboard-navigation",
      title: "Navigating Your Dashboard",
      icon: Monitor,
      for: "all",
      items: [
        {
          title: "Dashboard Overview (Seekers)",
          steps: [
            "Welcome Card: Personalized greeting and quick stats",
            "Begin Session: Start browsing for immediate support",
            "Available Sessions: See live sessions you can join now",
            "Quick Actions: Access crisis resources, browse sessions, book appointments",
            "Need Help?: Find platform documentation and support",
            "Navigation: Use the top bar to access different sections"
          ]
        },
        {
          title: "Dashboard Overview (Volunteers)",
          steps: [
            "Availability Toggle: Set yourself as online/offline",
            "Active Sessions: View and manage your current sessions",
            "Session Stats: Track your total sessions, hours, and ratings",
            "Create Session: Quick access to start a new session",
            "Upcoming Sessions: See your scheduled sessions",
            "Training Resources: Access continuing education and guidelines"
          ]
        },
        {
          title: "Using the Navigation Bar",
          steps: [
            "Dashboard: Return to your main dashboard",
            "Sessions/Create Session: Access session management",
            "Training/Crisis Help: Find resources and support tools",
            "Help: Open platform documentation (this page)",
            "Notifications: Check alerts and reminders (bell icon)",
            "Profile Menu: Access settings, logout, and support options"
          ]
        }
      ]
    },
    {
      id: "notifications",
      title: "Notifications & Alerts",
      icon: Bell,
      for: "all",
      items: [
        {
          title: "Managing Notification Settings",
          steps: [
            "Go to Account Settings from your profile menu",
            "Navigate to 'Notifications' tab",
            "Choose which events trigger notifications",
            "Enable/disable email notifications",
            "Enable/disable browser push notifications",
            "Set quiet hours if you don't want notifications during specific times",
            "Save your preferences"
          ]
        },
        {
          title: "Types of Notifications",
          steps: [
            "Session Started: When a scheduled session begins",
            "Participant Joined: When someone joins your session (volunteers)",
            "Session Reminder: 15 minutes before a scheduled session",
            "New Message: When you receive a chat message",
            "Session Ended: When a session you're in concludes",
            "Platform Updates: Important announcements and features"
          ]
        }
      ]
    },
    {
      id: "safety-guidelines",
      title: "Safety & Community Guidelines",
      icon: Shield,
      for: "all",
      items: [
        {
          title: "Keeping Sessions Safe",
          steps: [
            "Never share personal information (full name, address, phone number)",
            "Don't request or share social media accounts",
            "Report any inappropriate behavior immediately",
            "Don't provide medical or legal advice",
            "Respect boundaries and consent",
            "All sessions should remain anonymous",
            "If you feel unsafe, leave the session immediately"
          ]
        },
        {
          title: "Reporting & Moderation",
          steps: [
            "Click the 'Report' button during any session",
            "Select the reason for the report",
            "Provide details about the incident",
            "Submit the report - it's reviewed within 24 hours",
            "You can report users, sessions, or messages",
            "Serious violations result in account suspension",
            "You'll be notified of the action taken"
          ]
        },
        {
          title: "Crisis Situations",
          steps: [
            "If someone expresses thoughts of self-harm, take it seriously",
            "Encourage them to call 988 (US) or their local crisis hotline",
            "Stay with them until they contact professional help",
            "Use the crisis protocol button to alert our team immediately",
            "Don't try to handle a crisis alone - involve professionals",
            "Access our Crisis Resources page for country-specific helplines"
          ]
        }
      ]
    },
    {
      id: "technical-support",
      title: "Technical Support & Troubleshooting",
      icon: HelpCircle,
      for: "all",
      items: [
        {
          title: "Audio/Video Issues",
          steps: [
            "Check your browser permissions for microphone access",
            "Ensure no other app is using your microphone",
            "Try refreshing the page",
            "Check your internet connection speed",
            "Use a wired connection instead of WiFi if possible",
            "Try a different browser (Chrome or Firefox recommended)",
            "Restart your device if issues persist"
          ]
        },
        {
          title: "Can't Find Sessions (Seekers)",
          steps: [
            "Ensure you're looking for volunteers in your country only",
            "Try adjusting your filters or removing search terms",
            "Check if any volunteers are currently online",
            "Try refreshing the page",
            "Check back during peak hours (evenings/weekends)",
            "Consider booking a scheduled session instead"
          ]
        },
        {
          title: "Getting Help",
          steps: [
            "Check this documentation page first",
            "Visit our FAQ page for common questions",
            "Contact support via the 'Contact Us' link in the footer",
            "Email support@listeningroom.com",
            "Expected response time is 24-48 hours",
            "For urgent platform issues, use the emergency contact form"
          ]
        }
      ]
    }
  ];

  const filteredSections = sections.filter(section => 
    userType === "all" || section.for === "all" || section.for === userType
  );

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-50">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="w-16 h-16 text-teal-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Platform Documentation
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete step-by-step guides for using Listening Room
          </p>

          {/* User Type Filter */}
          <div className="inline-flex rounded-2xl bg-white/95 backdrop-blur-xl shadow-lg border border-teal-100/60 p-1">
            <button
              onClick={() => setUserType("all")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                userType === "all"
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Guides
            </button>
            <button
              onClick={() => setUserType("seeker")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                userType === "seeker"
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Seekers
            </button>
            <button
              onClick={() => setUserType("volunteer")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                userType === "volunteer"
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Volunteers
            </button>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <a href="#getting-started" className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-teal-100/60 hover:shadow-2xl transition-all hover:-translate-y-1">
              <Home className="w-10 h-10 text-teal-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Getting Started</h3>
              <p className="text-gray-600 text-sm">Account setup and basics</p>
            </a>
            <a href="#session-tools" className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-teal-100/60 hover:shadow-2xl transition-all hover:-translate-y-1">
              <Settings className="w-10 h-10 text-teal-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Session Tools</h3>
              <p className="text-gray-600 text-sm">Features during sessions</p>
            </a>
            <a href="#safety-guidelines" className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-teal-100/60 hover:shadow-2xl transition-all hover:-translate-y-1">
              <Shield className="w-10 h-10 text-teal-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Safety First</h3>
              <p className="text-gray-600 text-sm">Guidelines and reporting</p>
            </a>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;

            return (
              <div key={section.id} id={section.id} className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-teal-100/60 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-teal-50/50 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-6">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border-l-4 border-teal-500 pl-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                        <ol className="space-y-3">
                          {item.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start space-x-3">
                              <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {stepIndex + 1}
                              </span>
                              <span className="text-gray-700 pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Help CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-xl mb-8 text-cyan-50">
            Our support team is here for you. We typically respond within 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-teal-600 px-8 py-4 rounded-2xl font-bold hover:bg-cyan-50 transition-all shadow-xl hover:shadow-2xl"
            >
              Contact Support
            </a>
            <a
              href="/faq"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              Visit FAQ
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

