import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ locals, cookies, url }) => {
  const params = url.searchParams;
  return new Response(
    await locals.db.startQuest(cookies.get("token"), params.get("id"), params.get("end_time"))
  );
};
