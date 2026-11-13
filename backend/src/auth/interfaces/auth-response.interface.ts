export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
