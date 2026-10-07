import type { User } from "../types/User";
import { parseUserProfile } from "../lib/userKb";
import { ApiError, getJson, sendJson } from "./client";

export function routeUnavailable(error: unknown) {
  return error instanceof ApiError && (error.status === 0 || error.status === 404 || error.status === 405);
}

function parseUsers(data: unknown): User[] | null {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && "items" in data && Array.isArray(data.items)
      ? data.items
      : null;
  if (!list) return null;
  const users: User[] = [];
  for (const item of list) {
    const user = parseUserProfile(item);
    if (!user) return null;
    users.push(user);
  }
  return users;
}

export async function listUsers(signal?: AbortSignal): Promise<User[] | null> {
  try {
    const data = await getJson<unknown>("/api/utilizadores", signal);
    return parseUsers(data);
  } catch (error) {
    if (routeUnavailable(error)) return null;
    throw error;
  }
}

export async function createUser(user: User, signal?: AbortSignal) {
  const data = await sendJson<unknown>("/api/utilizadores", "POST", user, signal);
  const saved = parseUserProfile(data);
  if (!saved) throw new ApiError("Request failed", 500);
  return saved;
}

export async function patchUser(user: User, signal?: AbortSignal) {
  const data = await sendJson<unknown>(`/api/utilizadores/${encodeURIComponent(user.user_id)}`, "PATCH", user, signal);
  const saved = parseUserProfile(data);
  if (!saved) throw new ApiError("Request failed", 500);
  return saved;
}
