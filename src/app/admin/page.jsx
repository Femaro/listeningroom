"use client";

import { useEffect } from "react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";

export default function AdminRedirect() {
  const { userProfile } = useFirebaseAuth();

  useEffect(() => {
    // Redirect to admin dashboard
    window.location.href = "/admin/dashboard";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to admin dashboard...</p>
      </div>
    </div>
  );
}