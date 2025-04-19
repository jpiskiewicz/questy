import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { base } from "$app/paths";

export const load: PageServerLoad = async ({ cookies, locals }) => {
  locals.db.logout(cookies);

  return redirect(302, base + "/login");
};
