// AppInitializer.tsx
import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { ThemeProvider } from "../theme/ThemeProvider";

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getUser = useAuthStore((state) => state.getUser);

  useEffect(() => {
    const user = getUser(); 
    console.log(user)
  }, [getUser]);

  return <ThemeProvider>{children}</ThemeProvider>;
};
