import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────
const { mockUserFns, mockAccountFns, mockCategoryFns, mockTransactionFns } =
  vi.hoisted(() => ({
    mockUserFns: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    mockAccountFns: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    mockCategoryFns: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    mockTransactionFns: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }));

vi.mock("@/lib/db", () => ({
  default: {
    user: mockUserFns,
    account: mockAccountFns,
    category: mockCategoryFns,
    transaction: mockTransactionFns,
    $transaction: vi.fn(),
  },
}));

import { categoryRepository } from "./category.repository";
import { userRepository } from "../user/user.repository";
import { categoryService } from "./category.service";

// ── Fixtures ───────────────────────────────────────────────────
const mockCategory = {
  id: "cat-1",
  name: "Salary",
  type: "INCOME" as const,
  userId: "user-1",
  createdAt: new Date(),
};

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  password: "hashed_pw",
  name: "Test User",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function clearAll() {
  vi.clearAllMocks();
  [mockUserFns, mockAccountFns, mockCategoryFns, mockTransactionFns].forEach(
    (fns) => Object.values(fns).forEach((fn) => fn.mockReset())
  );
}

// ── getCategories ──────────────────────────────────────────────
describe("categoryService.getCategories", () => {
  beforeEach(clearAll);

  it("should return categories for a given userId", async () => {
    const categories = [mockCategory];
    mockCategoryFns.findMany.mockResolvedValue(categories);

    const result = await categoryService.getCategories("user-1");

    expect(result).toEqual(categories);
    expect(mockCategoryFns.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("should return empty array when user has no categories", async () => {
    mockCategoryFns.findMany.mockResolvedValue([]);

    const result = await categoryService.getCategories("user-1");

    expect(result).toEqual([]);
  });

  it("should return both INCOME and EXPENSE categories", async () => {
    const categories = [
      { ...mockCategory, type: "INCOME" as const },
      {
        ...mockCategory,
        id: "cat-2",
        type: "EXPENSE" as const,
        name: "Food",
      },
    ];
    mockCategoryFns.findMany.mockResolvedValue(categories);

    const result = await categoryService.getCategories("user-1");

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("INCOME");
    expect(result[1].type).toBe("EXPENSE");
  });
});

// ── getCategoryById ────────────────────────────────────────────
describe("categoryService.getCategoryById", () => {
  beforeEach(clearAll);

  it("should return category when found", async () => {
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);

    const result = await categoryService.getCategoryById("cat-1");

    expect(result).toEqual(mockCategory);
    expect(mockCategoryFns.findUnique).toHaveBeenCalledWith({
      where: { id: "cat-1" },
    });
  });

  it("should throw 'Category not found' when category does not exist", async () => {
    mockCategoryFns.findUnique.mockResolvedValue(null);

    await expect(
      categoryService.getCategoryById("nonexistent")
    ).rejects.toThrow("Category not found");
  });

  it("should throw with empty string id", async () => {
    mockCategoryFns.findUnique.mockResolvedValue(null);

    await expect(categoryService.getCategoryById("")).rejects.toThrow(
      "Category not found"
    );
  });
});

// ── createCategory ─────────────────────────────────────────────
describe("categoryService.createCategory", () => {
  beforeEach(clearAll);

  it("should create an INCOME category with valid data", async () => {
    mockUserFns.findUnique.mockResolvedValue(mockUser);
    mockCategoryFns.create.mockResolvedValue(mockCategory);

    const result = await categoryService.createCategory({
      name: "Salary",
      type: "INCOME",
      userId: "user-1",
    });

    expect(result).toEqual(mockCategory);
    expect(mockUserFns.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(mockCategoryFns.create).toHaveBeenCalledWith({
      data: { name: "Salary", type: "INCOME", userId: "user-1" },
    });
  });

  it("should create an EXPENSE category with valid data", async () => {
    mockUserFns.findUnique.mockResolvedValue(mockUser);
    mockCategoryFns.create.mockResolvedValue({
      ...mockCategory,
      type: "EXPENSE",
      name: "Food",
    });

    const result = await categoryService.createCategory({
      name: "Food",
      type: "EXPENSE",
      userId: "user-1",
    });

    expect(result.type).toBe("EXPENSE");
    expect(result.name).toBe("Food");
  });

  it("should throw 'User not found' when user does not exist", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);

    await expect(
      categoryService.createCategory({
        name: "Salary",
        type: "INCOME",
        userId: "nonexistent",
      })
    ).rejects.toThrow("User not found");

    expect(mockCategoryFns.create).not.toHaveBeenCalled();
  });
});

// ── updateCategory ─────────────────────────────────────────────
describe("categoryService.updateCategory", () => {
  beforeEach(clearAll);

  it("should update category name", async () => {
    const updatedCategory = { ...mockCategory, name: "Updated Category" };
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mockCategoryFns.update.mockResolvedValue(updatedCategory);

    const result = await categoryService.updateCategory("cat-1", {
      name: "Updated Category",
    });

    expect(result).toEqual(updatedCategory);
    expect(mockCategoryFns.update).toHaveBeenCalledWith({
      where: { id: "cat-1" },
      data: { name: "Updated Category" },
    });
  });

  it("should update category type", async () => {
    const updatedCategory = { ...mockCategory, type: "EXPENSE" as const };
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mockCategoryFns.update.mockResolvedValue(updatedCategory);

    const result = await categoryService.updateCategory("cat-1", {
      type: "EXPENSE",
    });

    expect(result.type).toBe("EXPENSE");
  });

  it("should throw 'Category not found' when category does not exist", async () => {
    mockCategoryFns.findUnique.mockResolvedValue(null);

    await expect(
      categoryService.updateCategory("nonexistent", { name: "New" })
    ).rejects.toThrow("Category not found");

    expect(mockCategoryFns.update).not.toHaveBeenCalled();
  });
});

// ── deleteCategory ─────────────────────────────────────────────
describe("categoryService.deleteCategory", () => {
  beforeEach(clearAll);

  it("should delete an existing category", async () => {
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mockCategoryFns.delete.mockResolvedValue(mockCategory);

    await categoryService.deleteCategory("cat-1");

    expect(mockCategoryFns.findUnique).toHaveBeenCalledWith({
      where: { id: "cat-1" },
    });
    expect(mockCategoryFns.delete).toHaveBeenCalledWith({
      where: { id: "cat-1" },
    });
  });

  it("should throw 'Category not found' when category does not exist", async () => {
    mockCategoryFns.findUnique.mockResolvedValue(null);

    await expect(
      categoryService.deleteCategory("nonexistent")
    ).rejects.toThrow("Category not found");

    expect(mockCategoryFns.delete).not.toHaveBeenCalled();
  });
});
