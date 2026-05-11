import prisma from "@/lib/db";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.types";

export const categoryRepository = {
  getAll: () => prisma.category.findMany(),

  findById: (id: string) =>
    prisma.category.findUnique({ where: { id } }),

  create: (data: CreateCategoryInput) =>
    prisma.category.create({ data }),

  update: (id: string, data: UpdateCategoryInput) =>
    prisma.category.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.category.delete({ where: { id } }),

  findByUserId: (userId: string) =>
    prisma.category.findMany({ where: { userId } }),
};
