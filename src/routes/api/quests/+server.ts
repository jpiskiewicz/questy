import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, cookies }) => {
  const db = locals.db;
  const token = cookies.get("token");

  const quests = await db.getQuests(token);

  if (!quests) {
    return error(401, "Sesja wygasła.");
  }

  return new Response(JSON.stringify(quests));
};
