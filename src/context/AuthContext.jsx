import { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      loadUser(userId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (userId) => {
    try {
      const response = await api.get(`/users/profile/${userId}`);
      setUser(response.data);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (universityId, password) => {
    try {
      const response = await api.post("/auth/login", { universityId, password });
      const { token, userId } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      await loadUser(userId);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, email, password, role, universityId) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
      role,
      universityId,
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
