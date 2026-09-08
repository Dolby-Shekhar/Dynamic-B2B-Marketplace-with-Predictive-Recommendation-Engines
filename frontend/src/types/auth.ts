export type UserRole = 'admin' | 'buyer' | 'vendor';

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  organizationId?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  firstName: string;
  lastName: string;
  role?: UserRole;
}
