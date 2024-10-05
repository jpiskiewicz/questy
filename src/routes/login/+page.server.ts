import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";

export const actions = {
  login: async ({ request, locals, cookies }) => {
    const data = await request.formData();
    const [email, password] = [data.get("email"), data.get("password")];
    const db = locals.db;
    const token = await db.login(email, password);
    if (!token) {
      return fail(400, { message: "Niepoprawne dane logowania" });
    }
    cookies.set("token", token, { path: "/" });
    cookies.set("username", <string>email, { path: "/" });

    return { success: true };
  },
  register: async ({ request, locals }) => {
    const data = await request.formData();
    const [email, password] = [data.get("email"), data.get("password")];
    const db = locals.db;
    const success = await db.register(email, password);
    if (!success) {
      return fail(400, { message: "Użytkownik o podanym adresie email już istnieje" });
    }

    return { success, message: "Konto zostało utworzone" };
  }
} satisfies Actions;
