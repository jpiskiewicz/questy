import type { Actions, PageServerLoad } from "./$types";
import { QuestType } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = ({ locals, cookies }) => {
  const token = cookies.get("token");
  if (token === undefined) {
    return redirect(302, "/login");
  }

  const username = cookies.get("username");

  return {
    username,
    invalidationStream: locals.db.getStream(username)
  };
};

export const actions = {
  createQuest: async ({ request, locals, cookies }) => {
    const data = await request.formData();
    const db = locals.db;
    const success = await db.createQuest(
      cookies.get("token"),
      data.get("type") === QuestType.main ? QuestType.main : QuestType.side,
      data.get("title"),
      data.get("description"),
      data.get("time")
    );
    if (!success) {
      // Most probably authorization error
      return redirect(302, "/login");
    }
    return { success };
  }
} satisfies Actions;
