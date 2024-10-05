import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = ({ cookies }) => {
  const token = cookies.get("token");
  if (token === undefined) {
    return redirect(302, "/login");
  }
};
