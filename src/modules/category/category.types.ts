export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  userId: string;
  createdAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  userId: string;
}

export interface UpdateCategoryInput {
  name?: string;
  type?: CategoryType;
}
