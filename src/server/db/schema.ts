// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { nanoid } from "nanoid";
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `supervision-app_${name}`);

export const users = createTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    username: text("username").unique().notNull(),
    email: text("email").unique().notNull(),
  },
  (table) => ({
    nameIndex: uniqueIndex("user_name_idx").on(table.username),
    emailIndex: uniqueIndex("user_email_idx").on(table.email),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  key: one(keys),
  sessions: many(sessions),
}));

export const sessions = createTable(
  "session",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    userIndex: uniqueIndex("session_user_idx").on(table.userId),
  }),
);

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const keys = createTable(
  "key",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    hashedPassword: text("password"),
  },
  (table) => ({
    userIndex: uniqueIndex("key_user_idx").on(table.userId),
  }),
);

export const keyRelations = relations(keys, ({ one }) => ({
  user: one(users, { fields: [keys.userId], references: [users.id] }),
}));

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);
