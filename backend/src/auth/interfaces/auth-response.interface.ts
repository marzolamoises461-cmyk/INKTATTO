export interface AuthUser { id: number; email: string; fullName: string; role: string; }
export interface AuthResponse { accessToken: string; tokenType: 'Bearer'; expiresIn: number; user: AuthUser; }
