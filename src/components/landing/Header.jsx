import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Donate", href: "/donate" },
    { label: "Volunteer", href: "/volunteer" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-teal-100/50 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center">
              <img
                src="https://ucarecdn.com/dc54868d-20c4-46fa-b583-6f27b18e95b5/-/format/auto/"
                alt="ListeningRoom"
                className="h-12 object-contain"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-600 hover:text-teal-600 font-medium transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/account/signin"
              className="text-gray-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Sign In
            </a>
            <a
              href="/account/signup"
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-teal-600 transition-colors duration-200 shadow-sm"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-teal-600 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-gray-600 hover:text-teal-600 font-medium transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-200">
                <a
                  href="/account/signin"
                  className="block text-gray-600 hover:text-teal-600 font-medium transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="block bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-teal-600 transition-colors duration-200 text-center shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
