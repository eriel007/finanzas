import prisma from "@/lib/db";
import { CreateTransactionInput } from "./transaction.types";

export const transactionRepository = {
  create: (data: CreateTransactionInput) => {
    return prisma.transaction.create({ data });
  },

  updateAccountBalance: (accountId: string, amount: number) => {
    return prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: amount } },
    });
  },
};
