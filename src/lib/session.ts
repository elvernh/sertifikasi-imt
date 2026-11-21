// Login session stored in a signed cookie (library: jose).
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@/domain/types";

const COOKIE_NAME = "session";
const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET);

export type Session = { userId: number; role: Role };

/** Saves who is logged in, for one day. */
export async function createSession(userId: number, role: Role): Promise<void> {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

/** Returns the logged-in user, or null if nobody is logged in. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return { userId: payload.userId as number, role: payload.role as Role };
  } catch {
    return null; // expired or changed cookie
  }
}

/** Logs out. */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
