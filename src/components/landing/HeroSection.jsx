import { MapPin, Heart } from "lucide-react";
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
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Global Mental Health Support
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with trained volunteers from around the world. Anonymous,
            free, and available 24/7 in your local language.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Location Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Your Location</h3>
              </div>
              
              {/* Detected Location Display */}
              {selectedLocation && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">
                      Detected: {selectedLocation.country}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Currency: {selectedLocation.currency_symbol} {selectedLocation.currency_code}
                  </div>
                </div>
              )}
              
              <GlobalLocationSelector
                onLocationSelect={onLocationSelect}
                selectedLocation={selectedLocation}
                currencyInfo={currencyInfo}
              />
              <div className="mt-4 text-xs text-gray-500">
                We'll match you with volunteers who understand your culture and
                timezone
              </div>
            </div>
          </div>

          {/* Start Chat Button */}
          <div className="lg:col-span-1 flex flex-col justify-center">
            <div className="text-center">
              <button
                onClick={onStartChat}
                disabled={isMatching}
                className="w-full bg-blue-600 text-white px-8 py-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                {isMatching ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Finding volunteer...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Start Free Chat</span>
                  </div>
                )}
              </button>
              <p className="text-sm text-gray-600 mt-3">
                First 5 minutes are completely free
              </p>
            </div>
          </div>

          {/* Live Volunteer Availability */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Live Volunteer Availability</h3>
              </div>
              
              {liveStats.loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading stats...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {liveStats.availableVolunteers}
                    </div>
                    <div className="text-sm text-gray-600">
                      Available for Sessions
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {liveStats.onlineVolunteers} online • {liveStats.totalVolunteers} total
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {liveStats.availableSessions}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sessions Available Now
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Real-time data • Updated every few seconds
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
