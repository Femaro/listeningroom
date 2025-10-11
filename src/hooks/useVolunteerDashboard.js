"use client";

import { useState, useEffect, useCallback } from "react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { db } from "@/utils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function useVolunteerDashboard() {
    const { user, loading: userLoading } = useFirebaseAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [stats, setStats] = useState({});
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userLoading && !user) {
            setLoading(false);
            return;
        }

        if (!userLoading && user) {
            setLoading(true);
            
            // Set up real-time listener for active sessions
            const sessionsQuery = query(
                collection(db, "sessions"),
                where("volunteerId", "==", user.uid),
                where("status", "==", "active")
            );

            const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
                if (snapshot.docs.length > 0) {
                    setActiveSession(snapshot.docs[0].data());
                } else {
                    setActiveSession(null);
                }
            });

            // Set up real-time listener for availability status
            const availabilityQuery = query(
                collection(db, "volunteer_availability"),
                where("volunteerId", "==", user.uid)
            );

            const unsubscribeAvailability = onSnapshot(availabilityQuery, (snapshot) => {
                if (snapshot.docs.length > 0) {
                    const availabilityData = snapshot.docs[0].data();
                    setAvailability({
                        is_online: availabilityData.isOnline || false,
                        is_available: availabilityData.isAvailable || false,
                        max_concurrent_sessions: availabilityData.maxConcurrentSessions || 1,
                        current_active_sessions: availabilityData.currentActiveSessions || 0,
                        status_message: availabilityData.statusMessage || "",
                        last_active: availabilityData.lastActive || null,
                    });
                } else {
                    // Set default availability if no document exists
                    setAvailability({
                        is_online: false,
                        is_available: false,
                        max_concurrent_sessions: 1,
                        current_active_sessions: 0,
                        status_message: "",
                        last_active: null,
                    });
                }
            });

            // Set basic stats (can be enhanced later)
            setStats({
                totalSessions: 0,
                completedSessions: 0,
                averageRating: 0,
                totalHours: 0,
            });

            setLoading(false);

            // Cleanup function to unsubscribe
            return () => {
                unsubscribeSessions();
                unsubscribeAvailability();
            };
        }
    }, [user, userLoading]);
    
    useEffect(() => {
        if (!user) return;

        // Set up heartbeat to update last active time via API
        const heartbeat = setInterval(async () => {
            try {
                await fetch('/api/volunteers/availability', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.error("Heartbeat failed:", error);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(heartbeat);
    }, [user]);

    const handleTimeUpdate = useCallback((timeData) => {
        // Update any real-time displays
        console.log("Time update:", timeData);
    }, []);

    const handleAutoTerminate = useCallback(() => {
        // Handle auto-termination logic
        console.log("Session auto-terminated");
    }, []);

    return {
        user,
        loading: userLoading || loading,
        activeSession,
        stats,
        availability,
        handleTimeUpdate,
        handleAutoTerminate,
    };
}
