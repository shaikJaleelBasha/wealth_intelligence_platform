import { createContext } from "react";

export interface User {
  user_id: string;
  email: string;
  role_id: number;
  role_name: string;
}

export interface Profile {
  investor_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  dob: string | null;
  risk_profile: string;
  kyc_status: string;
  address: string | null;
  city: string;
  state: string;
  country: string;
}

export interface AuthContextType {
  user: User | null;

  profile: Profile | null;

  token: string | null;

  login: (user: User, profile: Profile, token: string) => void;

  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
