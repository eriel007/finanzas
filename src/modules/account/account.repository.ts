import prisma from "@/lib/db"

export const accountRepository = {
  getAll: () => prisma.account.findMany(),
};