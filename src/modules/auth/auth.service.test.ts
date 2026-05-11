import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Hoisted mocks (must be before vi.mock which gets hoisted) ──
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

// ── Mock bcryptjs ──────────────────────────────────────────────
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async (pw: string) => `hashed_${pw}`),
    compare: vi.fn(async (pw: string, hash: string) => {
      return hash === `hashed_${pw}`;
    }),
  },
}));

// ── Mock db (prisma) ──────────────────────────────────────────
vi.mock("@/lib/db", () => ({
  default: {
    user: mockUserFns,
    account: mockAccountFns,
    category: mockCategoryFns,
    transaction: mockTransactionFns,
    $transaction: vi.fn(),
  },
}));

// Import repositories AFTER mocks
import { userRepository } from "../user/user.repository";
import { authService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.schema";

// ── Helpers ────────────────────────────────────────────────────
function clearAll() {
  vi.clearAllMocks();
  [
    mockUserFns,
    mockAccountFns,
    mockCategoryFns,
    mockTransactionFns,
  ].forEach((fns) => {
    Object.values(fns).forEach((fn) => fn.mockReset());
  });
}

// ── Tests: register ────────────────────────────────────────────
describe("authService.register", () => {
  beforeEach(clearAll);
  afterEach(() => vi.restoreAllMocks());

  it("should register a new user with valid credentials and return user + token", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);
    mockUserFns.create.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: "hashed_password123",
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.register({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(result.user).toEqual({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
    });
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
    expect(mockUserFns.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(mockUserFns.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        password: "hashed_password123",
        name: "Test User",
      },
    });
  });

  it("should register a user without name (optional)", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);
    mockUserFns.create.mockResolvedValue({
      id: "user-2",
      email: "noname@example.com",
      password: "hashed_password123",
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.register({
      email: "noname@example.com",
      password: "password123",
    });

    expect(result.user.name).toBeNull();
    expect(result.token).toBeDefined();
  });

  it("should throw 'Email already in use' when email exists", async () => {
    mockUserFns.findUnique.mockResolvedValue({
      id: "existing-user",
      email: "test@example.com",
      password: "hashed_pw",
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      authService.register({
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Email already in use");

    expect(mockUserFns.create).not.toHaveBeenCalled();
  });

  it("should sanitize user output — password must not be in response", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);
    mockUserFns.create.mockResolvedValue({
      id: "user-3",
      email: "sanitize@example.com",
      password: "hashed_secret",
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.register({
      email: "sanitize@example.com",
      password: "secret123",
    });

    expect(result.user).not.toHaveProperty("password");
    expect(result.user).toHaveProperty("id");
    expect(result.user).toHaveProperty("email");
    expect(result.user).toHaveProperty("name");
  });
});

// ── Tests: login ───────────────────────────────────────────────
describe("authService.login", () => {
  beforeEach(clearAll);
  afterEach(() => vi.restoreAllMocks());

  it("should login with valid credentials and return user + token", async () => {
    const hashedPw = "hashed_password123";
    mockUserFns.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: hashedPw,
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.user).toEqual({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
    });
    expect(result.token).toBeDefined();
  });

  it("should throw 'Invalid credentials' when email does not exist", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({
        email: "nobody@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw 'Invalid credentials' when password is wrong", async () => {
    mockUserFns.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: "hashed_correct",
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      authService.login({
        email: "test@example.com",
        password: "wrong_password",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should sanitize user on login — no password in response", async () => {
    mockUserFns.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: "hashed_password123",
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.user).not.toHaveProperty("password");
  });
});

// ── Tests: verifyToken ─────────────────────────────────────────
describe("authService.verifyToken", () => {
  beforeEach(clearAll);
  afterEach(() => vi.restoreAllMocks());

  it("should verify a valid JWT token and return payload", async () => {
    mockUserFns.findUnique.mockResolvedValue(null);
    mockUserFns.create.mockResolvedValue({
      id: "user-verify",
      email: "verify@example.com",
      password: "hashed_pw",
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { token } = await authService.register({
      email: "verify@example.com",
      password: "password123",
    });

    const payload = await authService.verifyToken(token);

    expect(payload).toHaveProperty("id", "user-verify");
    expect(payload).toHaveProperty("email", "verify@example.com");
  });

  it("should reject an invalid token", async () => {
    await expect(authService.verifyToken("invalid-token-here")).rejects.toThrow();
  });

  it("should reject an empty token", async () => {
    await expect(authService.verifyToken("")).rejects.toThrow();
  });
});

// ── Tests: schemas ─────────────────────────────────────────────
describe("registerSchema", () => {
  it("should pass with valid data", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "Test",
    });
    expect(result.success).toBe(true);
  });

  it("should pass without name (optional)", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should fail with password shorter than 6 chars", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("should fail with empty password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("should fail with missing email", () => {
    const result = registerSchema.safeParse({
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should fail with missing password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("should pass with valid data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should fail with empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});
