import type { Cookies } from "@sveltejs/kit";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import mysql from "mysql2/promise";
import InvalidationStreams from "./InvalidationStreams";

export enum QuestType {
  main = "main",
  side = "side"
}

enum QuestStatus {
  created = "created",
  started = "started",
  finished = "finished"
}

interface Quest {
  id: number;
  user: string;
  type: QuestType;
  title: string;
  description: string;
  duration: number;
  status: QuestStatus;
  end_time: string;
}

interface AuthenticatedActionResultOk {
  ok: true;
  user: string;
  data: ResultSetHeader | RowDataPacket;
}

interface AuthenticatedActionResultFail {
  ok: false;
  user: null;
  data: null;
}

type AuthenticatedActionResult = AuthenticatedActionResultOk | AuthenticatedActionResultFail;

class Db {
  private streams = new InvalidationStreams();
  constructor(private conn: mysql.Connection) {}

  /* Checks whether the credentials are correct and returns
     new session token on success. */
  async login(email: string, password: string): Promise<string | null> {
    try {
      const [results] = await this.conn.query(
        `SELECT email FROM users WHERE email = "${email}" AND password = SHA2("${password}", 256);`
      );
      if (!results.length) return null;
    } catch (e) {
      console.log(e);
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

  logout(cookies: Cookies) {
    this.conn.query(`DELETE FROM tokens WHERE value = "${cookies.get("token")}";`);
    this.streams.delete(cookies.get("username")!);
    cookies.delete("token", { path: "/" });
    cookies.delete("username", { path: "/" });
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

  // Returns username corellated with the token
  private async authenticate(token: string): Promise<string> {
    try {
      await this.conn.query(`DELETE FROM tokens WHERE exp_date < NOW();`);
      const [results] = await this.conn.query(`SELECT user FROM tokens WHERE value = "${token}";`);
      if (results.length > 0) return results[0].user;
    } catch (err) {
      console.log(err);
    }

    return "";
  }

  private async performAuthenticatedAction(
    token: string,
    action: string
  ): Promise<AuthenticatedActionResult> {
    const username = await this.authenticate(token);
    if (!username) {
      return { ok: false, user: null, data: null };
    }
    try {
      const data = await this.conn.query(action.replace("{user}", username));
      return { ok: true, user: username, data };
    } catch (err) {
      console.log(err);
      return { ok: false, user: null, data: null };
    }
  }

  private getSeconds(duration: string): number {
    const [hours, minutes] = duration.split(":").map(v => parseInt(v));
    return hours * 3600 + minutes * 60;
  }

  async createQuest(
    token: string,
    type: QuestType,
    title: string,
    description: string,
    time: string
  ): Promise<boolean> {
    const res = await this.performAuthenticatedAction(
      token,
      `
      INSERT INTO quests (user, type, title, description, duration)
        VALUES ("{user}", "${type}", "${title}", "${description}", ${this.getSeconds(time)});
      `
    );
    if (res.ok) this.streams.invalidate(res.user);
    return res.ok;
  }

  async getQuests(token: string): Promise<Quest[] | null> {
    const res = await this.performAuthenticatedAction(
      token,
      "SELECT * FROM quests WHERE user == {user};"
    );
    if (res.ok) {
      return <Quest[]>(res.data as RowDataPacket)[0];
    }

    return null;
  }

  async getStream(token: string): Promise<ReadableStream | null> {
    const user = await this.authenticate(token);
    if (!user) return null;
    this.streams.create(user);
    return this.streams.getUserStream(user);
  }
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
