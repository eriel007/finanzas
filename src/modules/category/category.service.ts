import { categoryRepository } from "./category.repository";

export const categoryService = {
  getCategories : async()=>{
    return categoryRepository.getAll();
  },
};