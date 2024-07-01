// hooks/useAuth.ts
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState";

export const useAuth = () => {
  const [user, loading, error] = useSemaphoreAuthState();

  return {
    isAuthenticated: !!user,
    user,
    loading,
    error,
  };
};
