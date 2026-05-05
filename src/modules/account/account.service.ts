import { accountRepository } from "./account.repository";

export const accountService = {
  getAccounts : async()=>{
    return accountRepository.getAll();
  },
};