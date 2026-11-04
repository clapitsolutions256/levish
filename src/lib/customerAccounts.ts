import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";

// Levish signs its own customers in (it shares a Supabase project with Empulse, so Supabase Auth
// users would be shared between the two stores). Passwords are scrypt hashes in levish.profiles.

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

// A key of its own, so a customer token can never pass as an admin token.
const SECRET = `${process.env.JWT_SECRET || "levish-admin-secret-2026"}:customer`;
const AUDIENCE = "levish-customer";

export type CustomerClaims = { id: string; email: string; name: string };

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function signCustomerToken(customer: CustomerClaims) {
  return jwt.sign({ email: customer.email, name: customer.name }, SECRET, {
    subject: customer.id,
    audience: AUDIENCE,
    expiresIn: "30d",
  });
}

export function verifyCustomerToken(token: string): CustomerClaims | null {
  try {
    const decoded = jwt.verify(token, SECRET, { audience: AUDIENCE }) as jwt.JwtPayload;
    if (!decoded.sub || typeof decoded.email !== "string") return null;
    return { id: decoded.sub, email: decoded.email, name: String(decoded.name ?? "") };
  } catch {
    return null;
  }
}

/** A one-hour reset link token; only its hash is stored. */
export function newResetToken() {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashResetToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() };
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const PROFILE_FIELDS = "id, name, email, first_name, last_name, address, apartment, city, state, postal_code, phone";
