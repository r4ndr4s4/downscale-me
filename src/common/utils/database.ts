import postgres from "postgres";

import { env } from "./envConfig";

const sql = postgres(env.DATABASE_CONNECTION_STRING);

export default sql;
