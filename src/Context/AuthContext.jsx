import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { name, email, role, location, skills }

  useEffect(() => {
    const stored = localStorage.getItem("incidentUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("incidentUser");
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("incidentUser", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("incidentUser");
  };

  const register = (userData) => {
    // For hackathon: register = create user + login
    login(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
