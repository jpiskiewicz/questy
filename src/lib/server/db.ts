import mysql from "mysql2/promise";

class Db {
  constructor(conn: mysql.Connection) {}

  /* Checks whether the credentials are correct and returns
     new session token on success. */
  login(email: string, password: string): string {}

  /* Returns false if the user already exists */
  register(email: string, password: string): boolean {}
}

const createConnection = async (): Promise<Db> => {
  const conn = await mysql.createConnection({
    host: "http://localhost:3333",
    user: "root",
    password: import.meta.env.VITE_DB_PASS,
    database: "questy"
  });

  return new Db(conn);
};

export default createConnection;
