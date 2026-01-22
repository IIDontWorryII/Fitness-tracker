import bcrypt from "bcrypt";

/**
 * How expensive hashing is.
 * 10 is standard for student + production projects.
 */
const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password before storing it.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain-text password with a stored hash.
 * Used during login.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
