export interface JwtPayload {
    sub: string;
    email: string;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
}

export interface TokenResult {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface IJwtService {
    generateTokens(payload: JwtPayload): TokenResult;
    verifyRefreshToken(token: string): { sub: string };
}