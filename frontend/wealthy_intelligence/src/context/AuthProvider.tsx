import { useState } from "react";

import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";

import type { User, Profile } from "./AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    const storedProfile = localStorage.getItem("profile");

    return storedProfile ? JSON.parse(storedProfile) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const login = (userData: User, profileData: Profile, tokenData: string) => {
    localStorage.setItem("token", tokenData);

    localStorage.setItem("user", JSON.stringify(userData));

    localStorage.setItem("profile", JSON.stringify(profileData));

    setUser(userData);

    setProfile(profileData);

    setToken(tokenData);
  };

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("profile");

    setUser(null);

    setProfile(null);

    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
