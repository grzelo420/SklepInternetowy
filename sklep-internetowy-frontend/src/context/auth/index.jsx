import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loginContext = () => {
    setIsLoggedIn(true);
  };

  const logoutContext = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};
