import jwt from "jsonwebtoken";

/**
 * Verifies the Supabase access token sent as `Authorization: Bearer <token>`
 * from the browser, and returns the authenticated user's UUID.
 * Throws if missing/invalid/expired.
 */
export function getUserIdFromRequest(req: Request): string {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or malformed Authorization header.");
  }

  const token = authHeader.slice("Bearer ".length);
  const secret = process.env.SUPABASE_JWT_SECRET!;

  try {
    const payload = jwt.verify(token, secret, { audience: "authenticated" }) as {
      sub?: string;
    };
    if (!payload.sub) throw new AuthError("Token missing subject claim.");
    return payload.sub;
  } catch (e) {
    throw new AuthError(`Invalid or expired token: ${(e as Error).message}`);
  }
}

export class AuthError extends Error {}
