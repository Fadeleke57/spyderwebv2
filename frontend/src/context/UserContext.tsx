import { createContext, useContext, ReactNode } from "react";
import { PublicUser } from "@/types/user";
import { useCheckLoggedInUser, useLogout } from "@/hooks/user";
import { useRouter } from "next/router";

type UserContextType = {
  user: PublicUser | null | undefined;
  handleLogout: () => void;
  userLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  
  const {
    data: user,
    isLoading: userLoading,
    error,
    refetch: refetchUser,
  } = useCheckLoggedInUser();

  const {
    mutateAsync: logout,
    isPending: logoutLoading,
    error: logoutError,
  } = useLogout();

  if (userLoading) {
    return null;
  }

  if (error) {
    console.log("Error fetching user", error);
  }

  const handleLogout = async () => {
    await logout();
    
    refetchUser();
    router.push("/");
  };

  return (
    <UserContext.Provider
      value={{ user, handleLogout: handleLogout, userLoading }}
    >
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
