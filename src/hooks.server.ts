import type { Handle } from "@sveltejs/kit";
import createConnection from "$lib/server/db";

const db = await createConnection();

export const handle: Handle = ({ event, resolve }) => {
  event.locals.db = db;
  return resolve(event);
};
