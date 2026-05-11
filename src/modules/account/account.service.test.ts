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

import { accountRepository } from "./account.repository";
import { userRepository } from "../user/user.repository";
import { accountService } from "./account.service";

// ── Fixtures ───────────────────────────────────────────────────
const mockAccount = {
  id: "acc-1",
  name: "Main Account",
  balance: 1000,
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

// ── getAccounts ────────────────────────────────────────────────
describe("accountService.getAccounts", () => {
  beforeEach(clearAll);

  it("should return accounts for a given userId", async () => {
    const accounts = [mockAccount];
    mockAccountFns.findMany.mockResolvedValue(accounts);

    const result = await accountService.getAccounts("user-1");

    expect(result).toEqual(accounts);
    expect(mockAccountFns.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("should return empty array when user has no accounts", async () => {
    mockAccountFns.findMany.mockResolvedValue([]);

    const result = await accountService.getAccounts("user-1");

    expect(result).toEqual([]);
  });
});

// ── getAccountById ─────────────────────────────────────────────
describe("accountService.getAccountById", () => {
  beforeEach(clearAll);

  it("should return account when found", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);

    const result = await accountService.getAccountById("acc-1");

    expect(result).toEqual(mockAccount);
    expect(mockAccountFns.findUnique).toHaveBeenCalledWith({
      where: { id: "acc-1" },
    });
  });

  it("should throw 'Account not found' when account does not exist", async () => {
    mockAccountFns.findUnique.mockResolvedValue(null);

    await expect(accountService.getAccountById("nonexistent")).rejects.toThrow(
      "Account not found"
    );
  });

  it("should throw with empty string id", async () => {
    mockAccountFns.findUnique.mockResolvedValue(null);

    await expect(accountService.getAccountById("")).rejects.toThrow(
      "Account not found"
    );
  });
});

// ── createAccount ──────────────────────────────────────────────
describe("accountService.createAccount", () => {
  beforeEach(clearAll);

  it("should create an account with valid data", async () => {
    mockUserFns.findUnique.mockResolvedValue(mockUser);
    mockAccountFns.create.mockResolvedValue(mockAccount);

    const result = await accountService.createAccount({
      name: "Main Account",
      userId: "user-1",
    });

    expect(result).toEqual(mockAccount);
    expect(mockUserFns.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(mockAccountFns.create).toHaveBeenCalledWith({
      data: { name: "Main Account", userId: "user-1" },
    });
  });

  it("should create an account with initial balance", async () => {
    mockUserFns.findUnique.mockResolvedValue(mockUser);
    mockAccountFns.create.mockResolvedValue({
      ...mockAccount,
      balance: 500,
    });

    const result = await accountService.createAccount({
      name: "Savings",
      userId: "user-1",
      balance: 500,
    });

    expect(result.balance).toBe(500);
  });

  it("should throw 'User not found' when user does not exist", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);

    await expect(
      accountService.createAccount({
        name: "Main Account",
        userId: "nonexistent",
      })
    ).rejects.toThrow("User not found");

    expect(mockAccountFns.create).not.toHaveBeenCalled();
  });
});

// ── updateAccount ──────────────────────────────────────────────
describe("accountService.updateAccount", () => {
  beforeEach(clearAll);

  it("should update account name", async () => {
    const updatedAccount = { ...mockAccount, name: "Updated Name" };
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockAccountFns.update.mockResolvedValue(updatedAccount);

    const result = await accountService.updateAccount("acc-1", {
      name: "Updated Name",
    });

    expect(result).toEqual(updatedAccount);
    expect(mockAccountFns.update).toHaveBeenCalledWith({
      where: { id: "acc-1" },
      data: { name: "Updated Name" },
    });
  });

  it("should update account balance", async () => {
    const updatedAccount = { ...mockAccount, balance: 2000 };
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockAccountFns.update.mockResolvedValue(updatedAccount);

    const result = await accountService.updateAccount("acc-1", {
      balance: 2000,
    });

    expect(result.balance).toBe(2000);
  });

  it("should throw 'Account not found' when account does not exist", async () => {
    mockAccountFns.findUnique.mockResolvedValue(null);

    await expect(
      accountService.updateAccount("nonexistent", { name: "New" })
    ).rejects.toThrow("Account not found");

    expect(mockAccountFns.update).not.toHaveBeenCalled();
  });
});

// ── deleteAccount ──────────────────────────────────────────────
describe("accountService.deleteAccount", () => {
  beforeEach(clearAll);

  it("should delete an existing account", async () => {
    mockAccountFns.findUnique.mockResolvedValue(mockAccount);
    mockAccountFns.delete.mockResolvedValue(mockAccount);

    await accountService.deleteAccount("acc-1");

    expect(mockAccountFns.findUnique).toHaveBeenCalledWith({
      where: { id: "acc-1" },
    });
    expect(mockAccountFns.delete).toHaveBeenCalledWith({
      where: { id: "acc-1" },
    });
  });

  it("should throw 'Account not found' when account does not exist", async () => {
    mockAccountFns.findUnique.mockResolvedValue(null);

    await expect(accountService.deleteAccount("nonexistent")).rejects.toThrow(
      "Account not found"
    );

    expect(mockAccountFns.delete).not.toHaveBeenCalled();
  });
});
