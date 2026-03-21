import jwt from "jsonwebtoken";

type TokenPayload = {
  userId: number;
  email: string;
  role: string;
};

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1d") as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, secret, {
    expiresIn,
  });
}