import type { Actions, PageServerLoad } from "./$types";
import type { Db } from "$lib/server/db";
import { QuestType } from "$lib/types";
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

enum FormAction {
  Create = "createQuest",
  Edit = "editQuest"
}

const performFormAction = async (
  db: Db,
  action: FormAction,
  token: string | undefined,
  data: FormData
): Promise<{ success: boolean }> => {
  if (token === undefined) return redirect(302, "/login");
  const success = await db[action](
    token,
    data.get("type") === QuestType.main ? QuestType.main : QuestType.side,
    data.get("title") as string,
    data.get("description") as string,
    data.get("time") as string,
    data.get("id") as string
  );
  if (!success) return redirect(302, "/login");
  return { success };
};

export const actions = {
  createQuest: async ({ request, locals, cookies }) =>
    await performFormAction(
      locals.db,
      FormAction.Create,
      cookies.get("token"),
      await request.formData()
    ),
  editQuest: async ({ request, locals, cookies }) =>
    await performFormAction(
      locals.db,
      FormAction.Edit,
      cookies.get("token"),
      await request.formData()
    )
} satisfies Actions;
