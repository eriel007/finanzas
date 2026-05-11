import prisma from "@/lib/db";
import type { CreateTransactionInput, UpdateTransactionInput } from "./transaction.types";

export const transactionRepository = {
  getAll: (userId?: string) => {
    if (userId) {
      return prisma.transaction.findMany({ where: { userId } });
    }
    return prisma.transaction.findMany();
  },

  findById: (id: string) =>
    prisma.transaction.findUnique({ where: { id } }),

  create: (data: CreateTransactionInput) => {
    return prisma.transaction.create({ data });
  },

  update: (id: string, data: UpdateTransactionInput) =>
    prisma.transaction.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.transaction.delete({ where: { id } }),

  findByUserId: (userId: string) =>
    prisma.transaction.findMany({
      where: { userId },
      include: { account: { select: { name: true } }, category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),

  findByAccountId: (accountId: string) =>
    prisma.transaction.findMany({ where: { accountId } }),
};
