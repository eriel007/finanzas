import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock ───────────────────────────────────────────────
const mockAccountFns = vi.hoisted(() => ({
  getAccounts: vi.fn(),
  getAccountById: vi.fn(),
  createAccount: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccount: vi.fn(),
}));

vi.mock("@/modules/account/account.service", () => ({
  accountService: mockAccountFns,
}));

import { GET, POST } from "@/app/api/accounts/route";

// ── Fixtures ───────────────────────────────────────────────────
const mockUser = {
  id: "a3f8c2d1-4b5e-4f1a-9c8d-7e6f5a4b3c2d",
  email: "eriel@gmail.com",
  name: "eriel",
};

const mockAccount = {
  id: "b4c9d3e2-5c6f-4g2b-0d9e-8f7g6b5c4d3e",
  name: "Main",
  balance: 0,
  userId: mockUser.id,
  createdAt: new Date(),
};

function clearAll() {
  vi.clearAllMocks();
  Object.values(mockAccountFns).forEach((fn) => fn.mockReset());
}

// ── POST /api/accounts ─────────────────────────────────────────
describe("POST /api/accounts", () => {
  beforeEach(clearAll);

  it("should create an account with valid data", async () => {
    mockAccountFns.createAccount.mockResolvedValue(mockAccount);

    const request = new Request("http://localhost:3000/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Main", userId: mockUser.id }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({
      ...mockAccount,
      createdAt: mockAccount.createdAt.toISOString(),
    });
    expect(mockAccountFns.createAccount).toHaveBeenCalledWith({
      name: "Main",
      userId: mockUser.id,
    });
  });

  it("should create an account with initial balance", async () => {
    const accountWithBalance = { ...mockAccount, balance: 500 };
    mockAccountFns.createAccount.mockResolvedValue(accountWithBalance);

    const request = new Request("http://localhost:3000/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Savings",
        userId: mockUser.id,
        balance: 500,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.balance).toBe(500);
  });

  it("should return 400 when name is missing", async () => {
    const request = new Request("http://localhost:3000/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: mockUser.id }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("name and userId are required");
    expect(mockAccountFns.createAccount).not.toHaveBeenCalled();
  });

  it("should return 400 when userId is missing", async () => {
    const request = new Request("http://localhost:3000/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Main" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("name and userId are required");
    expect(mockAccountFns.createAccount).not.toHaveBeenCalled();
  });

  it("should return 404 when user does not exist", async () => {
    mockAccountFns.createAccount.mockRejectedValue(
      new Error("User not found")
    );

    const request = new Request("http://localhost:3000/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Main", userId: "nonexistent-user" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("should return 500 when an unexpected error occurs", async () => {
    mockAccountFns.createAccount.mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new Request("http://localhost:3000/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Main", userId: mockUser.id }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Error creating account");
  });
});

// ── GET /api/accounts ──────────────────────────────────────────
describe("GET /api/accounts", () => {
  beforeEach(clearAll);

  it("should return accounts for a valid userId", async () => {
    mockAccountFns.getAccounts.mockResolvedValue([mockAccount]);

    const request = new Request(
      `http://localhost:3000/api/accounts?userId=${mockUser.id}`
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([{
      ...mockAccount,
      createdAt: mockAccount.createdAt.toISOString(),
    }]);
  });

  it("should return empty array when user has no accounts", async () => {
    mockAccountFns.getAccounts.mockResolvedValue([]);

    const request = new Request(
      `http://localhost:3000/api/accounts?userId=${mockUser.id}`
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it("should return 400 when userId is missing", async () => {
    const request = new Request("http://localhost:3000/api/accounts");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("userId is required");
  });
});
