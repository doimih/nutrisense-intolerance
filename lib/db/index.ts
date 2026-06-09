import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __pg: ReturnType<typeof postgres> | undefined;
}

function createConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  return postgres(url, { max: 10, idle_timeout: 30, connect_timeout: 10 });
}

const queryClient = globalThis.__pg ?? createConnection();
if (process.env.NODE_ENV !== "production") globalThis.__pg = queryClient;

export const db = drizzle(queryClient, { schema });
export type Db = typeof db;
