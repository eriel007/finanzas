export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  userId: string;
  accountId: string;
  categoryId: string;
  createdAt: Date;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  description?: string;
  userId: string;
  accountId: string;
  categoryId: string;
}

export interface UpdateTransactionInput {
  amount?: number;
  type?: TransactionType;
  description?: string;
  categoryId?: string;
}
