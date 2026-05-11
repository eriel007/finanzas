import { accountRepository } from "./account.repository";
import { userRepository } from "../user/user.repository";
import type { CreateAccountInput, UpdateAccountInput } from "./account.types";

export const accountService = {
  getAccounts: async (userId: string) => {
    return accountRepository.findByUserId(userId);
  },

  getAccountById: async (id: string) => {
    const account = await accountRepository.findById(id);
    if (!account) throw new Error("Account not found");
    return account;
  },

  createAccount: async (data: CreateAccountInput) => {
    const user = await userRepository.findById(data.userId);
    if (!user) throw new Error("User not found");
    return accountRepository.create(data);
  },

  updateAccount: async (id: string, data: UpdateAccountInput) => {
    const existing = await accountRepository.findById(id);
    if (!existing) throw new Error("Account not found");
    return accountRepository.update(id, data);
  },

  deleteAccount: async (id: string) => {
    const existing = await accountRepository.findById(id);
    if (!existing) throw new Error("Account not found");
    return accountRepository.delete(id);
  },
};
