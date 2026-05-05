export interface Account {
  id: string;
  name: string;
  balance: number;
  userId: string;
  createdAt: Date;
}

export interface CreateAccountInput {
  name: string;
  balance?: number;
  userId: string;
}

export interface UpdateAccountInput {
  name?: string;
  balance?: number;
}
