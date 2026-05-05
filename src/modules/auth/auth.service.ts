import { AuthCredentials, AuthResponse } from "./auth.types";

export const authService = {
  login: async (_credentials: AuthCredentials): Promise<AuthResponse> => {
    throw new Error("Not implemented");
  },
  register: async (_credentials: AuthCredentials): Promise<AuthResponse> => {
    throw new Error("Not implemented");
  },
};
