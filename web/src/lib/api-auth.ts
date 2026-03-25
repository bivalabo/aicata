/**
 * API Authentication Middleware
 *
 * Single-tenant auth check: finds the active store via Prisma.
 * Provides requireStore() and optionalStore() helpers for route handlers.
 */

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Represents an authenticated store context
 */
export interface AuthStore {
  id: string;
  shop: string;
  accessToken: string;
}

/**
 * AuthError: thrown when auth check fails
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Fetch the active store (most recently updated).
 * Pattern: single-tenant app treats the latest store as active.
 */
export async function getActiveStore(): Promise<AuthStore | null> {
  const store = await prisma.store.findFirst({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      shop: true,
      accessToken: true,
    },
  });
  return store as AuthStore | null;
}

/**
 * Require an authenticated store.
 * Throws AuthError (401) if no store is found.
 */
export async function requireStore(): Promise<AuthStore> {
  const store = await getActiveStore();
  if (!store) {
    throw new AuthError("ストアが接続されていません", 401);
  }
  return store;
}

/**
 * Optionally get the active store.
 * Returns null if no store is found (useful for public endpoints).
 */
export async function optionalStore(): Promise<AuthStore | null> {
  return getActiveStore();
}

/**
 * Higher-order function: wraps an API handler with auth error handling.
 * Catches AuthError and returns a 401 JSON response.
 *
 * Usage:
 *   export const GET = withAuth(async (req) => {
 *     const store = await requireStore();
 *     // ... handler logic
 *   });
 */
export function withAuth(
  handler: (req: Request, ...args: any[]) => Promise<Response>,
) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode },
        );
      }
      throw error;
    }
  };
}
