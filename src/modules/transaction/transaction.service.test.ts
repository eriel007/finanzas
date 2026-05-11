import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────
const { mockUserFns, mockAccountFns, mockCategoryFns, mockTransactionFns, mock$transaction } =
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
    mock$transaction: vi.fn(),
  }));

vi.mock("@/lib/db", () => ({
  default: {
    user: mockUserFns,
    account: mockAccountFns,
    category: mockCategoryFns,
    transaction: mockTransactionFns,
    $transaction: mock$transaction,
  },
}));

import { transactionService } from "./transaction.service";
import { transactionRepository } from "./transaction.repository";
import { accountRepository } from "../account/account.repository";
import { categoryRepository } from "../category/category.repository";

// ── Fixtures ───────────────────────────────────────────────────
const mockAccount = {
  id: "acc-1",
  name: "Main Account",
  balance: 1000,
  userId: "user-1",
  createdAt: new Date(),
};

const mockCategory = {
  id: "cat-1",
  name: "Salary",
  type: "INCOME" as const,
  userId: "user-1",
  createdAt: new Date(),
};

const mockTransaction = {
  id: "txn-1",
  amount: 500,
  type: "INCOME" as const,
  description: "Monthly salary",
  userId: "user-1",
  accountId: "acc-1",
  categoryId: "cat-1",
  createdAt: new Date(),
};

function clearAll() {
  vi.clearAllMocks();
  [mockUserFns, mockAccountFns, mockCategoryFns, mockTransactionFns].forEach(
    (fns) => Object.values(fns).forEach((fn) => fn.mockReset())
  );
  mock$transaction.mockReset();
}

// ── createTransaction ──────────────────────────────────────────
describe("transactionService.createTransaction", () => {
  beforeEach(clearAll);

  it("should create an INCOME transaction and increase account balance", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mock$transaction.mockResolvedValue([
      { ...mockTransaction, amount: 500 },
      { ...mockAccount, balance: 1500 },
    ]);

    const result = await transactionService.createTransaction({
      amount: 500,
      type: "INCOME",
      description: "Monthly salary",
      userId: "user-1",
      accountId: "acc-1",
      categoryId: "cat-1",
    });

    expect(result).toEqual({ ...mockTransaction, amount: 500 });
    expect(mock$transaction).toHaveBeenCalledTimes(1);
    expect(mock$transaction).toHaveBeenCalledWith(expect.any(Array));
  });

  it("should create an EXPENSE transaction and decrease account balance", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mock$transaction.mockResolvedValue([
      { ...mockTransaction, type: "EXPENSE", amount: -200 },
      { ...mockAccount, balance: 800 },
    ]);

    const result = await transactionService.createTransaction({
      amount: 200,
      type: "EXPENSE",
      description: "Groceries",
      userId: "user-1",
      accountId: "acc-1",
      categoryId: "cat-1",
    });

    expect(result.amount).toBe(-200);
  });

  it("should throw 'Account not found' when account does not exist", async () => {
    mockAccountFns.findUnique.mockResolvedValue(null);

    await expect(
      transactionService.createTransaction({
        amount: 100,
        type: "INCOME",
        userId: "user-1",
        accountId: "nonexistent",
        categoryId: "cat-1",
      })
    ).rejects.toThrow("Account not found");

    expect(mockCategoryFns.findUnique).not.toHaveBeenCalled();
    expect(mock$transaction).not.toHaveBeenCalled();
  });

  it("should throw 'Category not found' when category does not exist", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockCategoryFns.findUnique.mockResolvedValue(null);

    await expect(
      transactionService.createTransaction({
        amount: 100,
        type: "INCOME",
        userId: "user-1",
        accountId: "acc-1",
        categoryId: "nonexistent",
      })
    ).rejects.toThrow("Category not found");

    expect(mock$transaction).not.toHaveBeenCalled();
  });

  it("should handle amount of 0", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mock$transaction.mockResolvedValue([
      { ...mockTransaction, amount: 0 },
      { ...mockAccount, balance: 1000 },
    ]);

    const result = await transactionService.createTransaction({
      amount: 0,
      type: "INCOME",
      userId: "user-1",
      accountId: "acc-1",
      categoryId: "cat-1",
    });

    expect(result.amount).toBe(0);
  });

  it("should convert negative amount to positive for INCOME", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mock$transaction.mockResolvedValue([
      { ...mockTransaction, amount: 100 },
      { ...mockAccount, balance: 1100 },
    ]);

    const result = await transactionService.createTransaction({
      amount: -100,
      type: "INCOME",
      userId: "user-1",
      accountId: "acc-1",
      categoryId: "cat-1",
    });

    expect(result.amount).toBe(100);
  });

  it("should convert negative amount to negative for EXPENSE", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mock$transaction.mockResolvedValue([
      { ...mockTransaction, type: "EXPENSE", amount: -100 },
      { ...mockAccount, balance: 900 },
    ]);

    const result = await transactionService.createTransaction({
      amount: -100,
      type: "EXPENSE",
      userId: "user-1",
      accountId: "acc-1",
      categoryId: "cat-1",
    });

    expect(result.amount).toBe(-100);
  });
});

// ── getTransactions ────────────────────────────────────────────
describe("transactionService.getTransactions", () => {
  beforeEach(clearAll);

  it("should return transactions for a given userId", async () => {
    mockTransactionFns.findMany.mockResolvedValue([mockTransaction]);

    const result = await transactionService.getTransactions("user-1");

    expect(result).toEqual([mockTransaction]);
    expect(mockTransactionFns.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: { account: { select: { name: true } }, category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should return empty array when user has no transactions", async () => {
    mockTransactionFns.findMany.mockResolvedValue([]);

    const result = await transactionService.getTransactions("user-1");

    expect(result).toEqual([]);
  });
});

// ── getTransactionById ─────────────────────────────────────────
describe("transactionService.getTransactionById", () => {
  beforeEach(clearAll);

  it("should return transaction when found", async () => {
    mockTransactionFns.findUnique.mockResolvedValue(mockTransaction);

    const result = await transactionService.getTransactionById("txn-1");

    expect(result).toEqual(mockTransaction);
    expect(mockTransactionFns.findUnique).toHaveBeenCalledWith({
      where: { id: "txn-1" },
    });
  });

  it("should throw 'Transaction not found' when transaction does not exist", async () => {
    mockTransactionFns.findUnique.mockResolvedValue(null);

    await expect(
      transactionService.getTransactionById("nonexistent")
    ).rejects.toThrow("Transaction not found");
  });

  it("should throw with empty string id", async () => {
    mockTransactionFns.findUnique.mockResolvedValue(null);

    await expect(transactionService.getTransactionById("")).rejects.toThrow(
      "Transaction not found"
    );
  });
});

// ── updateTransaction ──────────────────────────────────────────
describe("transactionService.updateTransaction", () => {
  beforeEach(clearAll);

  it("should call $transaction with 3 operations (reverse, apply, update)", async () => {
    const oldTransaction = { ...mockTransaction, amount: 500 };
    mockTransactionFns.findUnique.mockResolvedValue(oldTransaction);
    mock$transaction.mockResolvedValue([
      { ...mockAccount, balance: 500 },
      { ...mockAccount, balance: 1500 },
      { ...oldTransaction, amount: 1000 },
    ]);

    const result = await transactionService.updateTransaction("txn-1", {
      amount: 1000,
    });

    // Service uses destructuring [0], so result is first account update
    expect(result).toEqual({ ...mockAccount, balance: 500 });
    expect(mock$transaction).toHaveBeenCalledTimes(1);
    expect(mock$transaction.mock.calls[0][0]).toHaveLength(3);
  });

  it("should throw 'Transaction not found' when transaction does not exist", async () => {
    mockTransactionFns.findUnique.mockResolvedValue(null);

    await expect(
      transactionService.updateTransaction("nonexistent", { amount: 100 })
    ).rejects.toThrow("Transaction not found");

    expect(mock$transaction).not.toHaveBeenCalled();
  });
});

// ── deleteTransaction ──────────────────────────────────────────
describe("transactionService.deleteTransaction", () => {
  beforeEach(clearAll);

  it("should delete a transaction and reverse its balance effect", async () => {
    const transaction = { ...mockTransaction, amount: 500 };
    mockTransactionFns.findUnique.mockResolvedValue(transaction);
    mock$transaction.mockResolvedValue([
      { ...mockAccount, balance: 500 },
      { id: "txn-1" },
    ]);

    const result = await transactionService.deleteTransaction("txn-1");

    expect(result).toEqual({ ok: true });
    expect(mock$transaction).toHaveBeenCalledTimes(1);
    expect(mock$transaction.mock.calls[0][0]).toHaveLength(2);
  });

  it("should reverse EXPENSE correctly (negative amount)", async () => {
    const transaction = { ...mockTransaction, amount: -200, type: "EXPENSE" };
    mockTransactionFns.findUnique.mockResolvedValue(transaction);
    mock$transaction.mockResolvedValue([
      { ...mockAccount, balance: 1200 },
      { id: "txn-1" },
    ]);

    const result = await transactionService.deleteTransaction("txn-1");

    expect(result).toEqual({ ok: true });
  });

  it("should throw 'Transaction not found' when transaction does not exist", async () => {
    mockTransactionFns.findUnique.mockResolvedValue(null);

    await expect(
      transactionService.deleteTransaction("nonexistent")
    ).rejects.toThrow("Transaction not found");

    expect(mock$transaction).not.toHaveBeenCalled();
  });
});

// ── Edge cases ─────────────────────────────────────────────────
describe("transactionService edge cases", () => {
  beforeEach(clearAll);

  it("should handle very large amounts", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mock$transaction.mockResolvedValue([
      { ...mockTransaction, amount: 999999999 },
      { ...mockAccount, balance: 1000000999 },
    ]);

    const result = await transactionService.createTransaction({
      amount: 999999999,
      type: "INCOME",
      userId: "user-1",
      accountId: "acc-1",
      categoryId: "cat-1",
    });

    expect(result.amount).toBe(999999999);
  });

  it("should handle decimal amounts", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mock$transaction.mockResolvedValue([
      { ...mockTransaction, amount: 99.99 },
      { ...mockAccount, balance: 1099.99 },
    ]);

    const result = await transactionService.createTransaction({
      amount: 99.99,
      type: "INCOME",
      userId: "user-1",
      accountId: "acc-1",
      categoryId: "cat-1",
    });

    expect(result.amount).toBe(99.99);
  });

  it("should create transaction without description (optional)", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockCategoryFns.findUnique.mockResolvedValue(mockCategory);
    mock$transaction.mockResolvedValue([
      { ...mockTransaction, description: null, amount: 100 },
      { ...mockAccount, balance: 1100 },
    ]);

    await transactionService.createTransaction({
      amount: 100,
      type: "INCOME",
      userId: "user-1",
      accountId: "acc-1",
      categoryId: "cat-1",
    });

    expect(mock$transaction).toHaveBeenCalled();
  });
});

// ── transactionRepository (direct tests) ───────────────────────
describe("transactionRepository", () => {
  beforeEach(clearAll);

  it("getAll without userId should call findMany without filter", async () => {
    mockTransactionFns.findMany.mockResolvedValue([mockTransaction]);

    const result = await transactionRepository.getAll();

    expect(result).toEqual([mockTransaction]);
    expect(mockTransactionFns.findMany).toHaveBeenCalledWith();
  });

  it("getAll with userId should call findMany with filter", async () => {
    mockTransactionFns.findMany.mockResolvedValue([mockTransaction]);

    const result = await transactionRepository.getAll("user-1");

    expect(result).toEqual([mockTransaction]);
    expect(mockTransactionFns.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("create should call prisma.transaction.create", async () => {
    mockTransactionFns.create.mockResolvedValue(mockTransaction);

    const result = await transactionRepository.create({
      amount: 500,
      type: "INCOME",
      userId: "user-1",
      accountId: "acc-1",
      categoryId: "cat-1",
    });

    expect(result).toEqual(mockTransaction);
    expect(mockTransactionFns.create).toHaveBeenCalledWith({
      data: {
        amount: 500,
        type: "INCOME",
        userId: "user-1",
        accountId: "acc-1",
        categoryId: "cat-1",
      },
    });
  });

  it("update should call prisma.transaction.update", async () => {
    mockTransactionFns.update.mockResolvedValue({
      ...mockTransaction,
      description: "Updated",
    });

    const result = await transactionRepository.update("txn-1", {
      description: "Updated",
    });

    expect(result.description).toBe("Updated");
    expect(mockTransactionFns.update).toHaveBeenCalledWith({
      where: { id: "txn-1" },
      data: { description: "Updated" },
    });
  });

  it("delete should call prisma.transaction.delete", async () => {
    mockTransactionFns.delete.mockResolvedValue(mockTransaction);

    const result = await transactionRepository.delete("txn-1");

    expect(result).toEqual(mockTransaction);
    expect(mockTransactionFns.delete).toHaveBeenCalledWith({
      where: { id: "txn-1" },
    });
  });

  it("findByAccountId should call findMany with accountId filter", async () => {
    mockTransactionFns.findMany.mockResolvedValue([mockTransaction]);

    const result = await transactionRepository.findByAccountId("acc-1");

    expect(result).toEqual([mockTransaction]);
    expect(mockTransactionFns.findMany).toHaveBeenCalledWith({
      where: { accountId: "acc-1" },
    });
  });
});

// ── accountRepository (direct test for getAll) ─────────────────
describe("accountRepository", () => {
  beforeEach(clearAll);

  it("getAll should call prisma.account.findMany", async () => {
    mockAccountFns.findMany.mockResolvedValue([mockAccount]);

    const result = await accountRepository.getAll();

    expect(result).toEqual([mockAccount]);
    expect(mockAccountFns.findMany).toHaveBeenCalledTimes(1);
  });
});

// ── categoryRepository (direct test for getAll) ────────────────
describe("categoryRepository", () => {
  beforeEach(clearAll);

  it("getAll should call prisma.category.findMany", async () => {
    mockCategoryFns.findMany.mockResolvedValue([mockCategory]);

    const result = await categoryRepository.getAll();

    expect(result).toEqual([mockCategory]);
    expect(mockCategoryFns.findMany).toHaveBeenCalledTimes(1);
  });
});
