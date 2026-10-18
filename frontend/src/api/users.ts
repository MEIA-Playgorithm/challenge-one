import { config } from "../lib/config";
import { parseUsersCsv, userToRow } from "../lib/users";
import type { User } from "../types/User";
import { request } from "./request";
import { knowledgeBaseRoutes as routes } from "./routes";

const knowledgeBase = () => ({ label: "Knowledge base", baseUrl: config.knowledgeBaseUrl });

const json = (user: User): RequestInit => ({
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userToRow(user)),
});

export async function getUsers() {
    const response = await request(knowledgeBase(), routes.usersCsv);
    return parseUsersCsv(await response.text());
}

export async function createUser(user: User) {
    await request(knowledgeBase(), routes.users, { method: "POST", ...json(user) });
}

export async function updateUser(previousId: string, user: User) {
    await request(knowledgeBase(), routes.user(previousId), { method: "PUT", ...json(user) });
}

export async function deleteUser(userId: string) {
    await request(knowledgeBase(), routes.user(userId), { method: "DELETE" });
}
