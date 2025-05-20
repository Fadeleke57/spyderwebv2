import { createContext, useContext, ReactNode } from "react";
import { PublicUser } from "@/types/user";
import { useCheckLoggedInUser } from "@/hooks/user";

type UserContextType = {
  user: PublicUser | null | undefined;
  logout: () => void;
  userLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    isLoading: userLoading,
    error,
    logout,
  } = useCheckLoggedInUser();

  if (userLoading) {
    return null;
  }

  if (error) {
    console.log("Error fetching user", error);
  }

  return (
    <UserContext.Provider value={{ user, logout: logout, userLoading }}>
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
