import { transactionRepository } from "./transaction.repository";
import { CreateTransactionInput } from "./transaction.types";

export const transactionService = {
  createTransaction: async (data: CreateTransactionInput) => {
    const { type, amount, accountId } = data;

    const finalAmount =
      type === "EXPENSE" ? -Math.abs(amount) : Math.abs(amount);

    await transactionRepository.updateAccountBalance(accountId, finalAmount);

    return transactionRepository.create(data);
  },
};
