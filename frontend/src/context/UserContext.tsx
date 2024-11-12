import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useFetchUser } from "@/hooks/user";
import { PublicUser } from "@/types/user";

type UserContextType = {
  user: PublicUser | null;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading, error, Logout } = useFetchUser();

  if (loading) {
    return null;
  }

  if (error) {
    console.log("Error fetching user", error);
  }

  return (
    <UserContext.Provider value={{ user, logout: Logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
