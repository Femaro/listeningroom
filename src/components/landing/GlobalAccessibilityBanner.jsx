import { Globe, Clock, Shield } from "lucide-react";

export default function GlobalAccessibilityBanner() {
  return (
    <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center space-x-6 text-sm font-medium">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>40+ Countries</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/30"></div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>24/7 Support</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/30"></div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>100% Anonymous</span>
          </div>
        </div>
      </div>
    </div>
  );
}
