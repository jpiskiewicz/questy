import mysql from "mysql2/promise";

class Db {
  constructor(private conn: mysql.Connection) {}

  /* Checks whether the credentials are correct and returns
     new session token on success. */
  async login(email: string, password: string): Promise<string | null> {
    try {
      const [results] = await this.conn.query(
        `SELECT email FROM users WHERE email = "${email}" AND password = SHA2("${password}", 256);`
      );
      if (!results.length) return null;
    } catch (_) {
      return null;
    }

    try {
      const res = await this.conn.query(
        `
        SET @value = UUID();
        INSERT INTO tokens
        VALUES ("${email}", @value, DATE_ADD(NOW(), INTERVAL 1 DAY));
        SELECT @value;
        `
      );
      return res[0][2][0]["@value"];
    } catch (_) {
      return null;
    }
  }

  logout(token: string) {
    this.conn.query(`DELETE FROM tokens WHERE value = "${token}";`);
  }

  /* Returns false if the user already exists */
  async register(email: string, password: string): Promise<boolean> {
    password = password.replaceAll('"', '\\"');
    try {
      await this.conn.query(`INSERT INTO users VALUES ("${email}", SHA2("${password}", 256));`);
    } catch (_) {
      return false;
    }

    return true;
  }

  async createQuest(
    token: string,
    type: string,
    title: string,
    description: string,
    time: string
  ): Promise<boolean> {}
}

const createConnection = async (): Promise<Db> => {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "svelte",
    password: import.meta.env.VITE_DB_PASS,
    database: "quests",
    multipleStatements: true
  });

  return new Db(conn);
};

export default createConnection;
