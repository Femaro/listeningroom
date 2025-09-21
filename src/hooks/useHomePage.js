"use client";

import { useState, useEffect } from "react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { db } from "@/utils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function useHomePage() {
  const { user, userProfile, loading: userLoading } = useFirebaseAuth();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currencyInfo, setCurrencyInfo] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [liveStats, setLiveStats] = useState({
    onlineVolunteers: 0,
    totalVolunteers: 0,
    availableVolunteers: 0,
    availableSessions: 0,
    loading: true
  });

  useEffect(() => {
    if (user && userProfile && !userLoading) {
      // Only redirect if user has a complete profile
      window.location.href = "/dashboard";
    }
  }, [user, userProfile, userLoading]);

  // Fetch available volunteers from API
  const fetchAvailableVolunteers = async () => {
    try {
      const response = await fetch('/api/volunteers/availability');
      if (response.ok) {
        const data = await response.json();
        setLiveStats(prev => ({
          ...prev,
          availableVolunteers: data.volunteers?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching available volunteers:', error);
    }
  };

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try to get user's location using browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Use reverse geocoding to get location details
              try {
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const data = await response.json();
                
                const location = {
                  country: data.countryName || "Unknown",
                  country_code: data.countryCode || "US",
                  city: data.city || data.locality || "Unknown",
                  currency_code: getCurrencyCode(data.countryCode),
                  currency_symbol: getCurrencySymbol(data.countryCode),
                  coordinates: { latitude, longitude }
                };
                
                setSelectedLocation(location);
                setCurrencyInfo({
                  currency: location.currency_code,
                  rate: 1,
                  currency_symbol: location.currency_symbol
                });
              } catch (error) {
                console.error("Reverse geocoding failed:", error);
                setDefaultLocation();
              }
            },
            (error) => {
              console.error("Geolocation failed:", error);
              setDefaultLocation();
            },
            { timeout: 10000, enableHighAccuracy: true }
          );
        } else {
          setDefaultLocation();
        }
      } catch (error) {
        console.error("Location detection failed:", error);
        setDefaultLocation();
      }
    };

    const setDefaultLocation = () => {
      const defaultLocation = {
        country: "United States",
        country_code: "US",
        city: "Unknown",
        currency_code: "USD",
        currency_symbol: "$",
        coordinates: null
      };
      setSelectedLocation(defaultLocation);
      setCurrencyInfo({
        currency: "USD",
        rate: 1,
        currency_symbol: "$"
      });
    };

    detectLocation();
  }, []);

  // Load live stats
  useEffect(() => {
    if (!db) return;

    // Listen to volunteers collection for online volunteers
    const volunteersQuery = query(collection(db, "users"), where("userType", "==", "volunteer"));
    const volunteersUnsubscribe = onSnapshot(volunteersQuery, (snapshot) => {
      const totalVolunteers = snapshot.docs.length;
      
      // Count online volunteers (those with recent activity)
      const now = new Date();
      const onlineVolunteers = snapshot.docs.filter(doc => {
        const data = doc.data();
        const lastSeen = data.lastSeen?.toDate?.() || data.createdAt?.toDate?.();
        if (!lastSeen) return false;
        
        // Consider online if last seen within 30 minutes
        const timeDiff = now.getTime() - lastSeen.getTime();
        return timeDiff < 30 * 60 * 1000; // 30 minutes
      }).length;

      setLiveStats(prev => ({
        ...prev,
        totalVolunteers,
        onlineVolunteers
      }));
    });

    // Listen to sessions collection for available sessions
    const sessionsQuery = query(collection(db, "sessions"), where("status", "==", "waiting"));
    const sessionsUnsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const availableSessions = snapshot.docs.length;
      setLiveStats(prev => ({
        ...prev,
        availableSessions,
        loading: false
      }));
    });

    return () => {
      volunteersUnsubscribe();
      sessionsUnsubscribe();
    };
  }, []);

  // Fetch available volunteers periodically
  useEffect(() => {
    fetchAvailableVolunteers();
    const interval = setInterval(fetchAvailableVolunteers, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Helper functions for currency detection
  const getCurrencyCode = (countryCode) => {
    const currencyMap = {
      'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'AU': 'AUD', 'DE': 'EUR',
      'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR',
      'AT': 'EUR', 'IE': 'EUR', 'PT': 'EUR', 'FI': 'EUR', 'GR': 'EUR',
      'LU': 'EUR', 'MT': 'EUR', 'CY': 'EUR', 'SK': 'EUR', 'SI': 'EUR',
      'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR', 'JP': 'JPY', 'CN': 'CNY',
      'IN': 'INR', 'BR': 'BRL', 'MX': 'MXN', 'RU': 'RUB', 'KR': 'KRW',
      'SG': 'SGD', 'HK': 'HKD', 'NZ': 'NZD', 'CH': 'CHF', 'NO': 'NOK',
      'SE': 'SEK', 'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF',
      'RO': 'RON', 'BG': 'BGN', 'HR': 'HRK', 'TR': 'TRY', 'ZA': 'ZAR',
      'EG': 'EGP', 'NG': 'NGN', 'KE': 'KES', 'GH': 'GHS', 'MA': 'MAD',
      'TN': 'TND', 'DZ': 'DZD', 'LY': 'LYD', 'SD': 'SDG', 'ET': 'ETB',
      'UG': 'UGX', 'TZ': 'TZS', 'ZW': 'ZWL', 'BW': 'BWP', 'NA': 'NAD',
      'SZ': 'SZL', 'LS': 'LSL', 'MW': 'MWK', 'ZM': 'ZMW', 'AO': 'AOA',
      'MZ': 'MZN', 'MG': 'MGA', 'MU': 'MUR', 'SC': 'SCR', 'KM': 'KMF',
      'DJ': 'DJF', 'SO': 'SOS', 'ER': 'ERN', 'SS': 'SSP', 'CF': 'XAF',
      'TD': 'XAF', 'CM': 'XAF', 'GQ': 'XAF', 'GA': 'XAF', 'CG': 'XAF',
      'CD': 'CDF', 'ST': 'STN', 'CV': 'CVE', 'GW': 'XOF', 'GN': 'GNF',
      'ML': 'XOF', 'BF': 'XOF', 'NE': 'XOF', 'SN': 'XOF', 'CI': 'XOF',
      'TG': 'XOF', 'BJ': 'XOF', 'LR': 'LRD', 'SL': 'SLE', 'GM': 'GMD',
      'GN': 'GNF', 'GW': 'XOF', 'CV': 'CVE', 'ST': 'STN', 'AO': 'AOA',
      'MZ': 'MZN', 'MG': 'MGA', 'MU': 'MUR', 'SC': 'SCR', 'KM': 'KMF',
      'DJ': 'DJF', 'SO': 'SOS', 'ER': 'ERN', 'SS': 'SSP'
    };
    return currencyMap[countryCode] || 'USD';
  };

  const getCurrencySymbol = (countryCode) => {
    const symbolMap = {
      'US': '$', 'CA': 'C$', 'GB': '£', 'AU': 'A$', 'DE': '€', 'FR': '€',
      'IT': '€', 'ES': '€', 'NL': '€', 'BE': '€', 'AT': '€', 'IE': '€',
      'PT': '€', 'FI': '€', 'GR': '€', 'LU': '€', 'MT': '€', 'CY': '€',
      'SK': '€', 'SI': '€', 'EE': '€', 'LV': '€', 'LT': '€', 'JP': '¥',
      'CN': '¥', 'IN': '₹', 'BR': 'R$', 'MX': '$', 'RU': '₽', 'KR': '₩',
      'SG': 'S$', 'HK': 'HK$', 'NZ': 'NZ$', 'CH': 'CHF', 'NO': 'kr',
      'SE': 'kr', 'DK': 'kr', 'PL': 'zł', 'CZ': 'Kč', 'HU': 'Ft',
      'RO': 'lei', 'BG': 'лв', 'HR': 'kn', 'TR': '₺', 'ZA': 'R',
      'EG': '£', 'NG': '₦', 'KE': 'KSh', 'GH': '₵', 'MA': 'د.م.',
      'TN': 'د.ت', 'DZ': 'د.ج', 'LY': 'ل.د', 'SD': 'ج.س.', 'ET': 'Br',
      'UG': 'USh', 'TZ': 'TSh', 'ZW': 'Z$', 'BW': 'P', 'NA': 'N$',
      'SZ': 'L', 'LS': 'L', 'MW': 'MK', 'ZM': 'ZK', 'AO': 'Kz',
      'MZ': 'MT', 'MG': 'Ar', 'MU': '₨', 'SC': '₨', 'KM': 'CF',
      'DJ': 'Fdj', 'SO': 'S', 'ER': 'Nfk', 'SS': '£', 'CF': 'FCFA',
      'TD': 'FCFA', 'CM': 'FCFA', 'GQ': 'FCFA', 'GA': 'FCFA', 'CG': 'FCFA',
      'CD': 'FC', 'ST': 'Db', 'CV': '$', 'GW': 'CFA', 'GN': 'FG',
      'ML': 'CFA', 'BF': 'CFA', 'NE': 'CFA', 'SN': 'CFA', 'CI': 'CFA',
      'TG': 'CFA', 'BJ': 'CFA', 'LR': 'L$', 'SL': 'Le', 'GM': 'D',
      'GN': 'FG', 'GW': 'CFA', 'CV': '$', 'ST': 'Db', 'AO': 'Kz',
      'MZ': 'MT', 'MG': 'Ar', 'MU': '₨', 'SC': '₨', 'KM': 'CF',
      'DJ': 'Fdj', 'SO': 'S', 'ER': 'Nfk', 'SS': '£'
    };
    return symbolMap[countryCode] || '$';
  };

  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);

    if (location.currency_code) {
      try {
        const response = await fetch("/api/location/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country_code: location.country_code,
            currency: location.currency_code,
          }),
        });

        const data = await response.json();
        if (data.currency_info) {
          setCurrencyInfo({
            currency: data.currency_info.currency,
            rate: data.currency_info.rate,
            currency_symbol: location.currency_symbol || "$",
          });
        }
      } catch (error) {
        console.error("Currency update failed:", error);
      }
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      window.location.href = "/account/signup";
      return;
    }

    setIsMatching(true);

    try {
      const response = await fetch("/api/volunteers/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seeker_country_code: selectedLocation?.country_code || "US",
          preferred_volunteer_countries:
            selectedLocation?.country_code !== "GLOBAL"
              ? [selectedLocation?.country_code]
              : [],
          language_preferences: ["en"],
          volunteer_radius_km:
            selectedLocation?.country_code === "GLOBAL" ? 0 : 1000,
        }),
      });

      const data = await response.json();

      if (data.session_id) {
        window.location.href = `/chat/${data.session_id}`;
      } else {
        alert(
          data.message ||
            "No volunteers available right now. Please try again in a few moments.",
        );
      }
    } catch (error) {
      console.error("Matching failed:", error);
      alert("Failed to connect. Please try again.");
    }

    setIsMatching(false);
  };
  
  return {
    user,
    userProfile,
    userLoading,
    selectedLocation,
    currencyInfo,
    isMatching,
    liveStats,
    handleLocationSelect,
    handleStartChat
  };
}
