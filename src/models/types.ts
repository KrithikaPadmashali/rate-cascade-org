
// Entity Types
export interface User {
  id: number;
  username: string;
  password: string; // In a real app, this would be a hashed password
  role: 'ADMIN' | 'BRANCH_MANAGER';
  branchId?: number;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  rate: number;
  parentId: number | null;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  name: string;
  balance: number;
  rate: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RateUpdateRequest {
  rate: number;
}

export interface BranchWithChildrenAndAccounts {
  branch: Branch;
  children: Branch[];
  accounts: Account[];
}
