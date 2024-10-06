import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = ({ cookies }) => {
  const token = cookies.get("token");
  if (token === undefined) {
    return redirect(302, "/login");
  }

  return { username: cookies.get("username") };
};
