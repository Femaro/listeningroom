import { Globe, Shield, Heart, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Section */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img
              src="https://ucarecdn.com/dc54868d-20c4-46fa-b583-6f27b18e95b5/-/format/auto/"
              alt="Listening Room"
              className="h-12 object-contain mb-4 brightness-0 invert"
            />
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              A global peer support platform connecting people who need to be heard with compassionate volunteer listeners.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-bold mb-4 text-lg flex items-center space-x-2">
              <Shield className="w-5 h-5 text-teal-400" />
              <span>Support</span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/how-it-works" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center space-x-2">
                  <span>How It Works</span>
                </a>
              </li>
              <li>
                <a href="/safety" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Safety & Privacy
                </a>
              </li>
              <li>
                <a href="/crisis-resources" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Crisis Resources
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-400 hover:text-teal-400 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="font-bold mb-4 text-lg flex items-center space-x-2">
              <Heart className="w-5 h-5 text-teal-400" />
              <span>Get Involved</span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/volunteer" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Become a Volunteer
                </a>
              </li>
              <li>
                <a href="/donate" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Make a Donation
                </a>
              </li>
              <li>
                <a href="/training" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Training Program
                </a>
              </li>
              <li>
                <a href="/volunteer-guide" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Volunteer Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-bold mb-4 text-lg flex items-center space-x-2">
              <Globe className="w-5 h-5 text-teal-400" />
              <span>Platform</span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-teal-400 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/api-docs" className="text-gray-400 hover:text-teal-400 transition-colors">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; 2025 CLAEVA INTERNATIONAL LLC. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Globe className="w-4 h-4 text-teal-400" />
              <span>Making mental health support accessible worldwide</span>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-center text-sm text-gray-300">
            <span className="font-bold text-red-400">Crisis?</span> Call 988 (US) or visit{" "}
            <a href="/crisis-resources" className="text-teal-400 hover:text-teal-300 underline">
              crisis-resources
            </a>
            {" "}for immediate help
          </p>
        </div>
      </div>
    </footer>
  );
}
