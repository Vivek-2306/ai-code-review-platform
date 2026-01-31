/**
 * Common TypeScript type definitions
 */

// User types
export interface User {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: {
    id: string;
    email: string;
  };
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  roleId: string;
  user: User;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiError {
  error: string;
  code?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
