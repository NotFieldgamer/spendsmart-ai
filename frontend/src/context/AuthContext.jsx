import { createContext, useEffect, useState } from "react";
import { subscribeUserToPush } from "../utils/pushManager";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // 🔁 HYDRATE FROM STORAGE ON APP LOAD
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setReady(true);
  }, []);

  const login = async (jwt, userObj) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userObj));

    setToken(jwt);
    setUser(userObj);

    // ✅ init push AFTER login
    initPush(jwt);
  };

  const initPush = async (jwt) => {
    if (!("Notification" in window)) return;

    const key = import.meta.env.VITE_VAPID_PUBLIC;
    if (!key) return;

    if (Notification.permission === "granted") {
      await subscribeUserToPush(key, jwt);
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout }}>
      {ready ? children : null}
    </AuthContext.Provider>
  );
};
