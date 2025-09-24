import { useCallback } from "react";

// Using Firebase auth instead of @auth/create
function useAuth() {
  const signIn = useCallback(() => {
    // Firebase sign in logic would go here
    console.log('Firebase sign in');
  }, []);

  const signOut = useCallback(() => {
    // Firebase sign out logic would go here
    console.log('Firebase sign out');
  }, []);

  return { signIn, signOut };
}

export { useAuth };