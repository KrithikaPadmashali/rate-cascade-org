
import { Account, AuthResponse, Branch, BranchWithChildrenAndAccounts, LoginRequest, RateUpdateRequest, User } from "@/models/types";

// This would be your API base URL in a real application
const API_BASE_URL = 'http://localhost:8080/api';

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
};

// Auth API
export const login = async (loginRequest: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginRequest),
  });
  return handleResponse(response);
};

// Branch API
export const getBranchDetails = async (branchId: number): Promise<BranchWithChildrenAndAccounts> => {
  const response = await fetch(`${API_BASE_URL}/branches/${branchId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateBranchRate = async (branchId: number, rateRequest: RateUpdateRequest): Promise<Branch> => {
  const response = await fetch(`${API_BASE_URL}/branches/${branchId}/rate`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(rateRequest),
  });
  return handleResponse(response);
};

export const createBranch = async (branch: Partial<Branch>): Promise<Branch> => {
  const response = await fetch(`${API_BASE_URL}/branches`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(branch),
  });
  return handleResponse(response);
};

// Account API
export const createAccount = async (account: Partial<Account>): Promise<Account> => {
  const response = await fetch(`${API_BASE_URL}/accounts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(account),
  });
  return handleResponse(response);
};

export const updateAccount = async (accountId: number, account: Partial<Account>): Promise<Account> => {
  const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(account),
  });
  return handleResponse(response);
};

// Mock Data for Frontend Development
export const mockLogin = (request: LoginRequest): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (request.username === 'admin' && request.password === 'password') {
        resolve({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'admin',
            password: 'hashed-password',
            role: 'ADMIN',
          }
        });
      } else if (request.username === 'branch' && request.password === 'password') {
        resolve({
          token: 'mock-jwt-token',
          user: {
            id: 2,
            username: 'branch',
            password: 'hashed-password',
            role: 'BRANCH_MANAGER',
            branchId: 2
          }
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};

export const mockGetBranchDetails = (branchId: number): Promise<BranchWithChildrenAndAccounts> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (branchId === 1) {
        // Root branch with children
        resolve({
          branch: {
            id: 1,
            name: 'Headquarters',
            code: 'HQ',
            rate: 5.0,
            parentId: null,
            level: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          children: [
            {
              id: 2,
              name: 'West Region',
              code: 'WR',
              rate: 5.0,
              parentId: 1,
              level: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 3,
              name: 'East Region',
              code: 'ER',
              rate: 5.0,
              parentId: 1,
              level: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ],
          accounts: []
        });
      } else if (branchId === 2) {
        // West Region with children and accounts
        resolve({
          branch: {
            id: 2,
            name: 'West Region',
            code: 'WR',
            rate: 5.0,
            parentId: 1,
            level: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          children: [
            {
              id: 4,
              name: 'California Branch',
              code: 'CA',
              rate: 5.0,
              parentId: 2,
              level: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ],
          accounts: [
            {
              id: 1,
              accountNumber: 'WR-001',
              name: 'West Region General',
              balance: 1000000,
              rate: 5.0,
              branchId: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ]
        });
      } else {
        // Default empty branch
        resolve({
          branch: {
            id: branchId,
            name: `Branch ${branchId}`,
            code: `BR${branchId}`,
            rate: 5.0,
            parentId: 1,
            level: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          children: [],
          accounts: []
        });
      }
    }, 500);
  });
};

export const mockUpdateBranchRate = (branchId: number, rateRequest: RateUpdateRequest): Promise<Branch> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: branchId,
        name: `Branch ${branchId}`,
        code: `BR${branchId}`,
        rate: rateRequest.rate,
        parentId: branchId > 1 ? 1 : null,
        level: branchId > 1 ? 1 : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }, 500);
  });
};
