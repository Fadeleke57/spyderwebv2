import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { PublicUser } from "@/types/user";
import { useCheckUserState } from "@/hooks/user";

type UserContextType = {
  user: PublicUser | null | undefined;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: loading, error, logout } = useCheckUserState();

  if (loading) {
    return null;
  }

  if (error) {
    console.log("Error fetching user", error);
  }

  return (
    <UserContext.Provider value={{ user, logout: logout }}>
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
