import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { base } from "$app/paths";

export const actions = {
  login: async ({ request, cookies, fetch }) => {
    const body = await request.formData();
    const resp = await fetch(base + "/api2/login", { method: "POST", body });
    if (!resp.ok) {
      return fail(401, { message: "Niepoprawne dane logowania" });
    }
    const json = await resp.json();
    console.log(json);
    cookies.set("token", json.token, { path: base });
    cookies.set("username", json.username, { path: base });

    return redirect(302, base);
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
