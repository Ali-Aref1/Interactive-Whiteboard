import { createContext, useContext } from "react";
import { User } from "../components/interfaces/User";
interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
export const UserContext = createContext({
  user: null,
  setUser: () => {},
} as UserContextType);

export const useAuth = () => {
  const auth = useContext(UserContext);
  if (!auth) throw new Error("Auth not found in context");
  return auth;
};