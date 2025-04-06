import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ locals, cookies, url }) => {
  const params = url.searchParams;
  return new Response(await locals.db.endQuest(cookies.get("token"), params.get("id")));
};
