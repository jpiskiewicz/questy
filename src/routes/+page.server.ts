import type { Actions, PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = ({ cookies }) => {
  const token = cookies.get("token");
  if (token === undefined) {
    return redirect(302, "/login");
  }

  return { username: cookies.get("username") };
};

export const actions = {
  createQuest: async ({ request, locals, cookies }) => {
    const data = await request.formData();
    const db = locals.db;
    console.log(data.get("time"));
    const success = await db.createQuest(
      cookies.get("token"),
      data.get("type"),
      data.get("title"),
      data.get("description"),
      data.get("time")
    );
    if (!success) {
      // Most probably authorization error
      cookies.delete("token", { path: "/" });
      cookies.delete("username", { path: "/" });
      return redirect(302, "/login");
    }
    return { success };
  }
} satisfies Actions;
