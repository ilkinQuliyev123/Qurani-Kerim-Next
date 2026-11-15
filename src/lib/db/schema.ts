import { pgTable, serial, integer, text, varchar, boolean, timestamp, primaryKey, uniqueIndex, index } from "drizzle-orm/pg-core";

export const surahs = pgTable("surahs", {
  id: integer("id").primaryKey(), // 1..114
  name: varchar("name", { length: 60 }).notNull(),
  ayahCount: integer("ayah_count").notNull(),
  about: text("about"),
});

export const ayahs = pgTable(
  "ayahs",
  {
    id: serial("id").primaryKey(),
    surahId: integer("surah_id").notNull(),
    number: integer("number").notNull(),
    arabic: text("arabic").notNull(),
    arabicPlain: text("arabic_plain").notNull(),
  },
  (t) => [uniqueIndex("ayahs_surah_number").on(t.surahId, t.number)],
);

export const translations = pgTable(
  "translations",
  {
    id: serial("id").primaryKey(),
    ayahId: integer("ayah_id").notNull(),
    lang: varchar("lang", { length: 2 }).notNull(),
    text: text("text").notNull(),
  },
  (t) => [uniqueIndex("translations_ayah_lang").on(t.ayahId, t.lang)],
);

export const words = pgTable(
  "words",
  {
    id: serial("id").primaryKey(),
    ayahId: integer("ayah_id").notNull(),
    order: integer("order").notNull(),
    arabic: varchar("arabic", { length: 100 }).notNull(),
    latin: varchar("latin", { length: 100 }).notNull(),
    meanAz: varchar("mean_az", { length: 200 }),
    meanEn: varchar("mean_en", { length: 200 }),
    meanRu: varchar("mean_ru", { length: 200 }),
    meanTr: varchar("mean_tr", { length: 200 }),
  },
  (t) => [index("words_ayah").on(t.ayahId)],
);

/** Ayəyə təfsir/şərh (WorkFlowy-dən): title = müəllif/mövzu. */
export const commentaries = pgTable(
  "commentaries",
  {
    id: serial("id").primaryKey(),
    ayahId: integer("ayah_id").notNull(),
    order: integer("order").notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    text: text("text").notNull(),
  },
  (t) => [index("commentaries_ayah").on(t.ayahId, t.order)],
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email").on(t.email)],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: integer("user_id").notNull(),
    ayahId: integer("ayah_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.ayahId] })],
);

export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    ayahId: integer("ayah_id").notNull(),
    text: varchar("text", { length: 2000 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("notes_user").on(t.userId, t.createdAt)],
);

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    ayahId: integer("ayah_id").notNull(),
    text: varchar("text", { length: 1000 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("comments_ayah").on(t.ayahId, t.createdAt)],
);
