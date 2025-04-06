import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ locals, cookies, url }) => {
  const params = url.searchParams;
  return new Response(await locals.db.deleteQuest(cookies.get("token"), params.get("id")));
};
