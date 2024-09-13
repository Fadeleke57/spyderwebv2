import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

type User = {
  username: string;
  full_name: string;
  email: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No token found");
        }

        const response = await api.get("/auth/me");

        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    setUser(null);
    await api.post("/auth/logout"); //backend session
    localStorage.removeItem("token"); //frontend session
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    })
    router.push("/auth/login");
  };

  if (loading) {
    return null;
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
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
