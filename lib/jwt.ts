import jwt from "jsonwebtoken";

function getJwtSecret() {
  // Try multiple possible secrets - dev server may use different one
  const secrets = [
    process.env.JWT_SECRET,
    "your-super-secret-jwt-key-change-this-in-production",
    "fallback-secret-change-me",
  ].filter(Boolean);
  
  // Use first available
  return secrets[0];
}

const JWT_SECRET = getJwtSecret() || "your-super-secret-jwt-key-change-this-in-production";
const COOKIE_NAME = "auth_token";

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    // Try other secrets if first fails
    for (const secret of ["your-super-secret-jwt-key-change-this-in-production", "fallback-secret-change-me"]) {
      try {
        return jwt.verify(token, secret) as { userId: string };
      } catch {
        continue;
      }
    }
    return null;
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export { COOKIE_NAME };
