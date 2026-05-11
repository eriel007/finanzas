import bcrypt from "bcryptjs";
import { userRepository } from "../user/user.repository";
import { generateToken, verifyToken } from "./jwt";
import type { AuthCredentials, AuthResponse, RegisterCredentials } from "./auth.types";

function sanitizeUser(user: { id: string; email: string; name: string | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export const authService = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const existingUser = await userRepository.findByEmail(credentials.email);
    if (existingUser) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    const user = await userRepository.create({
      email: credentials.email,
      password: hashedPassword,
      name: credentials.name,
    });

    const token = await generateToken({ id: user.id, email: user.email });

    return {
      user: sanitizeUser(user),
      token,
    };
  },

  login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) throw new Error("Invalid credentials");

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!isValidPassword) throw new Error("Invalid credentials");

    const token = await generateToken({ id: user.id, email: user.email });

    return {
      user: sanitizeUser(user),
      token,
    };
  },

  verifyToken,
};

export { generateToken, sanitizeUser };
