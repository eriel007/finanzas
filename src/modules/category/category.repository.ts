import prisma from "@/lib/db";

export const categoryRepository = {
  getAll: () => prisma.category.findMany(),
};
