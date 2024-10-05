import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";

export const actions = {
  default: async ({ request, locals, cookies }) => {
    const data = await request.formData();
    const [email, password] = [data.get("email"), data.get("password")];
    const db = locals.db;
    const token = db.login(email, password);
    if (!token) {
      return fail(400, { success: false });
    }
    cookies.set("token", token, { path: "/" });
    cookies.set("username", <string>email, { path: "/" });

    return { success: true };
  },
  register: async ({ request, locals }) => {
    const data = await request.formData();
    const [email, password] = [data.get("email"), data.get("password")];
    const db = locals.db;
    const success = db.register(email, password);
    if (!success) {
      return fail(400, { success });
    }

    return { success };
  }
} satisfies Actions;
