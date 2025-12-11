export interface JwtPayload {
    sub: string;
    username: string;
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