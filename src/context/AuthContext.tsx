import { createContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Успешно влизане!");
    } catch (error) {
      console.error("Error signing in:", error);
      let errorMessage = "Неуспешно влизане. Моля, опитайте отново.";

      if (error instanceof Error && "code" in error) {
        const firebaseError = error as { code: string };
        if (
          firebaseError.code === "auth/user-not-found" ||
          firebaseError.code === "auth/wrong-password"
        ) {
          errorMessage = "Невалиден имейл или парола.";
        } else if (firebaseError.code === "auth/invalid-email") {
          errorMessage = "Невалиден имейл адрес.";
        } else if (firebaseError.code === "auth/too-many-requests") {
          errorMessage = "Твърде много опити. Моля, опитайте по-късно.";
        }
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Успешно излизане!");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Неуспешно излизане. Моля, опитайте отново.");
    }
  };

  const value = {
    user,
    loading,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
