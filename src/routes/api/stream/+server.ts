import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, cookies }) => {
  const db = locals.db;
  const token = cookies.get("token");
  const stream = await db.getStream(token);

  if (!stream) {
    return error(401, "Sesja wygasła.");
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream"
    }
  });
};
