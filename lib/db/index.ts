import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as departments from './schema/departments';
import * as users from './schema/users';
import * as tickets from './schema/tickets';
import * as relations from './schema/relations';

const schema = { ...departments, ...users, ...tickets, ...relations };

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
