import prisma from "@/lib/db";
import type { CreateAccountInput, UpdateAccountInput } from "./account.types";

export const accountRepository = {
  getAll: () => prisma.account.findMany(),

  findById: (id: string) =>
    prisma.account.findUnique({ where: { id } }),

  create: (data: CreateAccountInput) =>
    prisma.account.create({ data }),

  update: (id: string, data: UpdateAccountInput) =>
    prisma.account.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.account.delete({ where: { id } }),

  findByUserId: (userId: string) =>
    prisma.account.findMany({ where: { userId } }),
};
