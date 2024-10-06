import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ cookies, locals }) => {
  locals.db.logout(cookies.get("token"));

  return redirect(302, "/login");
};
