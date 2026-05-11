import { categoryRepository } from "./category.repository";
import { userRepository } from "../user/user.repository";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.types";

export const categoryService = {
  getCategories: async (userId: string) => {
    return categoryRepository.findByUserId(userId);
  },

  getCategoryById: async (id: string) => {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
  },

  createCategory: async (data: CreateCategoryInput) => {
    const user = await userRepository.findById(data.userId);
    if (!user) throw new Error("User not found");
    return categoryRepository.create(data);
  },

  updateCategory: async (id: string, data: UpdateCategoryInput) => {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new Error("Category not found");
    return categoryRepository.update(id, data);
  },

  deleteCategory: async (id: string) => {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new Error("Category not found");
    return categoryRepository.delete(id);
  },
};
