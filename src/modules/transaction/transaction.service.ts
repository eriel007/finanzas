import prisma from "@/lib/db";
import { accountRepository } from "../account/account.repository";
import { categoryRepository } from "../category/category.repository";
import { transactionRepository } from "./transaction.repository";
import type { CreateTransactionInput, UpdateTransactionInput } from "./transaction.types";

function signAmount(type: "INCOME" | "EXPENSE", amount: number): number {
  return type === "EXPENSE" ? -Math.abs(amount) : Math.abs(amount);
}

export const transactionService = {
  createTransaction: async (data: CreateTransactionInput) => {
    const account = await accountRepository.findById(data.accountId);
    if (!account) throw new Error("Account not found");

    const category = await categoryRepository.findById(data.categoryId);
    if (!category) throw new Error("Category not found");

    const signedAmount = signAmount(data.type, data.amount);

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: { ...data, amount: signedAmount },
      }),
      prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: signedAmount } },
      }),
    ]);

    return transaction;
  },

  getTransactions: async (userId: string) => {
    return transactionRepository.findByUserId(userId);
  },

  getTransactionById: async (id: string) => {
    const transaction = await transactionRepository.findById(id);
    if (!transaction) throw new Error("Transaction not found");
    return transaction;
  },

  updateTransaction: async (id: string, data: UpdateTransactionInput) => {
    const oldTransaction = await transactionRepository.findById(id);
    if (!oldTransaction) throw new Error("Transaction not found");

    const newType = data.type ?? oldTransaction.type;
    const newAmount = data.amount ?? oldTransaction.amount;
    const newSignedAmount = signAmount(newType, newAmount);

    const [, , updatedTransaction] = await prisma.$transaction([
      prisma.account.update({
        where: { id: oldTransaction.accountId },
        data: { balance: { increment: -oldTransaction.amount } },
      }),
      prisma.account.update({
        where: { id: oldTransaction.accountId },
        data: { balance: { increment: newSignedAmount } },
      }),
      prisma.transaction.update({
        where: { id },
        data: { ...data, amount: newSignedAmount },
      }),
    ]);

    return updatedTransaction;
  },

  deleteTransaction: async (id: string) => {
    const transaction = await transactionRepository.findById(id);
    if (!transaction) throw new Error("Transaction not found");

    await prisma.$transaction([
      prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: -transaction.amount } },
      }),
      prisma.transaction.delete({ where: { id } }),
    ]);

    return { ok: true };
  },
};
