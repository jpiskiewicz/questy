import type { Actions, PageServerLoad } from "./$types";
import type { Db } from "$lib/server/db";
import { QuestType } from "$lib/types";
import { redirect } from "@sveltejs/kit";
import { base } from "$app/paths";

export const load: PageServerLoad = ({ locals, cookies }) => {
  const token = cookies.get("token");
  if (token === undefined) {
    return redirect(302, base + "/login");
  }
  return { username: cookies.get("username") };
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
  if (token === undefined) return redirect(302, base + "/login");
  const success = await db[action](
    token,
    data.get("type") === QuestType.Main ? QuestType.Main : QuestType.Side,
    data.get("title") as string,
    data.get("description") as string,
    data.get("time") as string,
    data.get("id") as string
  );
  if (!success) return redirect(302, base + "/login");
  return { success };
};

const getSeconds = (duration: string): string => {
  const [hours, minutes] = duration.split(":").map(v => parseInt(v));
  return (hours * 3600 + minutes * 60).toString();
};

export const actions = {
  createQuest: async ({ request, cookies, fetch }) => {
    const token = cookies.get("token");
    if (!token) return redirect(302, base + "/login");
    const body = await request.formData();
    body.set("time", getSeconds(body.get("time") as string));
    body.set("token", token);
    const resp = await fetch(base + "/api2/quests", { method: "POST", body });
    return { success: resp.ok };
  },
  editQuest: async ({ request, locals, cookies }) =>
    await performFormAction(
      locals.db,
      FormAction.Edit,
      cookies.get("token"),
      await request.formData()
    )
} satisfies Actions;
