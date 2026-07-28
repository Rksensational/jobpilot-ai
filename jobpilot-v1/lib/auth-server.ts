import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      callback(err || new Error("Signing key not found"));
      return;
    }
    callback(null, key.getPublicKey());
  });
}

export class AuthError extends Error {}

export function getUserIdFromRequest(req: Request): Promise<string> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Promise.reject(new AuthError("Missing or malformed Authorization header."));
  }
  const token = authHeader.slice("Bearer ".length);

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      { audience: "authenticated", algorithms: ["ES256"] },
      (err, decoded) => {
        if (err) {
          reject(new AuthError(`Invalid or expired token: ${err.message}`));
          return;
        }
        const sub = (decoded as { sub?: string })?.sub;
        if (!sub) {
          reject(new AuthError("Token missing subject claim."));
          return;
        }
        resolve(sub);
      }
    );
  });
}
