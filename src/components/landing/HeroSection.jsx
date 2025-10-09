import { MapPin, Heart, Sparkles, Globe, Shield } from "lucide-react";
import GlobalLocationSelector from "./GlobalLocationSelector";
import VolunteerAvailabilityMap from "./VolunteerAvailabilityMap";

export default function HeroSection({
  selectedLocation,
  currencyInfo,
  liveStats,
  onLocationSelect,
  onStartChat,
  isMatching,
}) {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-200 to-sky-200 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-teal-100/60 mb-8">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Anonymous • Free • 24/7 Support
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
              Global Mental Health
            </span>
            <br />
            <span className="text-gray-800">Support Network</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Connect with trained volunteers from around the world. Get compassionate support in your language, anytime you need it.
          </p>

          {/* Main CTA Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/60 p-8 sm:p-12 max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Location Card */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Your Location</h3>
                </div>
                
                {selectedLocation && (
                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl border border-teal-200/50 mb-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold text-teal-700">
                        {selectedLocation.country}
                      </span>
                    </div>
                    <div className="text-xs text-teal-600">
                      {selectedLocation.currency_symbol} {selectedLocation.currency_code}
                    </div>
                  </div>
                )}
                
                <GlobalLocationSelector
                  onLocationSelect={onLocationSelect}
                  selectedLocation={selectedLocation}
                  currencyInfo={currencyInfo}
                />
              </div>

              {/* Start Chat CTA */}
              <div className="space-y-4">
                <button
                  onClick={onStartChat}
                  disabled={isMatching}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMatching ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Finding volunteer...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Heart className="w-6 h-6" />
                      <span>Start Free Chat Now</span>
                    </div>
                  )}
                </button>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-teal-600" />
                    <span>100% Anonymous</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4 text-teal-600" />
                    <span>40+ Countries</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {liveStats.loading ? (
                <div className="col-span-3 text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl border border-teal-100">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                      {liveStats.availableVolunteers}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Available Now</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
                    <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                      {liveStats.onlineVolunteers}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Online</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl border border-teal-100">
                    <div className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                      {liveStats.availableSessions}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Sessions</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
