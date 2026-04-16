import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { User, IUser } from "./models/User";
import { connectDB } from "./db";

function getJwtSecret() {
  const secrets = [
    process.env.JWT_SECRET,
    "your-super-secret-jwt-key-change-this-in-production",
    "fallback-secret-change-me",
  ].filter(Boolean);
  return secrets[0];
}

const JWT_SECRET = getJwtSecret() || "your-super-secret-jwt-key-change-this-in-production";
const COOKIE_NAME = "auth_token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  // Try multiple secrets to handle env loading issues
  const secrets = [
    process.env.JWT_SECRET,
    "your-super-secret-jwt-key-change-this-in-production",
    "fallback-secret-change-me",
  ].filter(Boolean);

  for (const secret of secrets) {
    try {
      const payload = jwt.verify(token, secret as string) as { userId: string };
      return payload;
    } catch {
      continue;
    }
  }
  return null;
}

export async function getCurrentUser(): Promise<IUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId);
  return user;
}

export async function getUserFromRequest(request: NextRequest): Promise<IUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId);
  return user;
}

export { COOKIE_NAME };