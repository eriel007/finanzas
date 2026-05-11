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

import { userRepository } from "./user.repository";
import { userService } from "./user.service";

// ── Helpers ────────────────────────────────────────────────────
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

// ── getUsers ───────────────────────────────────────────────────
describe("userService.getUsers", () => {
  beforeEach(clearAll);

  it("should return all users", async () => {
    const users = [
      mockUser,
      { ...mockUser, id: "user-2", email: "test2@example.com" },
    ];
    mockUserFns.findMany.mockResolvedValue(users);

    const result = await userService.getUsers();

    expect(result).toEqual(users);
    expect(mockUserFns.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when no users exist", async () => {
    mockUserFns.findMany.mockResolvedValue([]);

    const result = await userService.getUsers();

    expect(result).toEqual([]);
  });
});

// ── getUserById ────────────────────────────────────────────────
describe("userService.getUserById", () => {
  beforeEach(clearAll);

  it("should return user when found", async () => {
    mockUserFns.findUnique.mockResolvedValue(mockUser);

    const result = await userService.getUserById("user-1");

    expect(result).toEqual(mockUser);
    expect(mockUserFns.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
  });

  it("should throw 'User not found' when user does not exist", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);

    await expect(userService.getUserById("nonexistent")).rejects.toThrow(
      "User not found"
    );
  });

  it("should throw with empty string id", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);

    await expect(userService.getUserById("")).rejects.toThrow("User not found");
  });
});

// ── createUser ─────────────────────────────────────────────────
describe("userService.createUser", () => {
  beforeEach(clearAll);

  it("should create a user with valid data", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);
    mockUserFns.create.mockResolvedValue(mockUser);

    const result = await userService.createUser({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(result).toEqual(mockUser);
    expect(mockUserFns.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(mockUserFns.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      },
    });
  });

  it("should create a user without name", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);
    mockUserFns.create.mockResolvedValue({ ...mockUser, name: null });

    const result = await userService.createUser({
      email: "noname@example.com",
      password: "password123",
    });

    expect(result.name).toBeNull();
  });

  it("should throw 'Email already in use' when email exists", async () => {
    mockUserFns.findUnique.mockResolvedValue(mockUser);

    await expect(
      userService.createUser({
        email: "test@example.com",
        password: "newpassword",
      })
    ).rejects.toThrow("Email already in use");

    expect(mockUserFns.create).not.toHaveBeenCalled();
  });
});

// ── updateUser ─────────────────────────────────────────────────
describe("userService.updateUser", () => {
  beforeEach(clearAll);

  it("should update user with valid data", async () => {
    const updatedUser = { ...mockUser, name: "Updated Name" };
    mockUserFns.findUnique.mockResolvedValue(mockUser);
    mockUserFns.update.mockResolvedValue(updatedUser);

    const result = await userService.updateUser("user-1", {
      name: "Updated Name",
    });

    expect(result).toEqual(updatedUser);
    expect(mockUserFns.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "Updated Name" },
    });
  });

  it("should update user email when not duplicated", async () => {
    mockUserFns.findUnique
      .mockResolvedValueOnce(mockUser) // findById
      .mockResolvedValueOnce(null); // findByEmail (no conflict)
    mockUserFns.update.mockResolvedValue({
      ...mockUser,
      email: "new@example.com",
    });

    const result = await userService.updateUser("user-1", {
      email: "new@example.com",
    });

    expect(result.email).toBe("new@example.com");
  });

  it("should allow keeping the same email", async () => {
    mockUserFns.findUnique
      .mockResolvedValueOnce(mockUser) // findById
      .mockResolvedValueOnce(mockUser); // findByEmail returns same user
    mockUserFns.update.mockResolvedValue(mockUser);

    const result = await userService.updateUser("user-1", {
      email: "test@example.com",
    });

    expect(result).toEqual(mockUser);
    expect(mockUserFns.update).toHaveBeenCalled();
  });

  it("should proceed to update even when user does not exist (service bug: findById result not checked)", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);
    mockUserFns.update.mockResolvedValue({ ...mockUser, name: "New Name" });

    // Service does NOT check findById result — it proceeds to update anyway
    // This is a service-level bug. The test reflects actual behavior.
    const result = await userService.updateUser("nonexistent", {
      name: "New Name",
    });

    expect(mockUserFns.findUnique).toHaveBeenCalledWith({
      where: { id: "nonexistent" },
    });
    expect(mockUserFns.update).toHaveBeenCalled();
  });

  it("should throw 'Email already in use' when new email belongs to another user", async () => {
    mockUserFns.findUnique
      .mockResolvedValueOnce(mockUser) // findById
      .mockResolvedValueOnce({
        // findByEmail — different user
        id: "other-user",
        email: "other@example.com",
        password: "hashed",
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    await expect(
      userService.updateUser("user-1", { email: "other@example.com" })
    ).rejects.toThrow("Email already in use");

    expect(mockUserFns.update).not.toHaveBeenCalled();
  });
});

// ── getUserEmail ───────────────────────────────────────────────
describe("userService.getUserEmail", () => {
  beforeEach(clearAll);

  it("should return user when email is found", async () => {
    mockUserFns.findUnique.mockResolvedValue(mockUser);

    const result = await userService.getUserEmail("test@example.com");

    expect(result).toEqual(mockUser);
    expect(mockUserFns.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });

  it("should return null when email does not exist", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);

    const result = await userService.getUserEmail("nobody@example.com");

    expect(result).toBeNull();
  });
});

// ── deleteUser ─────────────────────────────────────────────────
describe("userService.deleteUser", () => {
  beforeEach(clearAll);

  it("should delete an existing user", async () => {
    mockUserFns.findUnique.mockResolvedValue(mockUser);
    mockUserFns.delete.mockResolvedValue(mockUser);

    await userService.deleteUser("user-1");

    expect(mockUserFns.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(mockUserFns.delete).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
  });

  it("should throw when user does not exist", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);

    await expect(userService.deleteUser("nonexistent")).rejects.toThrow();

    expect(mockUserFns.delete).not.toHaveBeenCalled();
  });
});
