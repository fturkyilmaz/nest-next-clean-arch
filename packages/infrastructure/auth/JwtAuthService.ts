import jwt from "jsonwebtoken";

export class JwtAuthService {
    private readonly secret = process.env.JWT_SECRET || "secret";

    generateToken(payload: object) {
        return jwt.sign(payload, this.secret, { expiresIn: "1h" });
    }

    verifyToken(token: string) {
        return jwt.verify(token, this.secret);
    }
}
