import jwt from "jsonwebtoken";

/**
 * Verifies a JWT token and returns its payload.
 * Throws an error if the token is invalid or expired.
 * @param token The JWT token string.
 * @returns The decoded payload of the token.
 */
export function verifyToken(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET as string);
}
