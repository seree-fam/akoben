// context/AuthContext.tsx
import { createContext, useContext, ReactNode } from "react";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState";
import { User } from '@/components/User/User';

// Define the shape of your AuthContext
interface AuthContextType {
  user: User | null; // Replace `User` with the actual type of your user
  userLoading: boolean;
  userError: Error | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with a default value of `null`
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, userLoading, userError] = useSemaphoreAuthState();

  return (
    <AuthContext.Provider value={{ user, userLoading, userError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
