import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type {
  BookingKind,
  BookingStatus,
  EvolutionNote,
  MonthlyFee,
  Student,
  Weekday,
} from "@/types/pilates";

/* ---------- Better Auth ----------
 * Tables and columns follow the core schema Better Auth expects.
 */

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/**
 * Sign-in and sign-up attempts per IP. In the database, not in memory, so the
 * limit holds across every server instance on Vercel.
 */
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

/* ---------- Studio ----------
 * Ids are generated in the browser (`newId`), so every key starts with
 * user_id: one account can never write over a row of another, whatever id it sends.
 * Deleting the account removes everything in cascade.
 */

const owner = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

const money = (name: string) => numeric(name, { precision: 12, scale: 2, mode: "number" });

/** One row per account, created on the first visit. */
export const studioSettings = pgTable("studio_settings", {
  userId: owner().primaryKey(),
  sessionMinutes: integer("session_minutes").notNull(),
  breakMinutes: integer("break_minutes").notNull(),
  capacity: integer("capacity").notNull(),
  lastBackup: date("last_backup"),
});

export const plans = pgTable(
  "plans",
  {
    userId: owner(),
    id: text("id").notNull(),
    name: text("name").notNull(),
    weeklyClasses: integer("weekly_classes").notNull(),
    amount: money("amount").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

export const slots = pgTable(
  "slots",
  {
    userId: owner(),
    id: text("id").notNull(),
    weekday: smallint("weekday").$type<Weekday>().notNull(),
    startTime: text("start_time").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

/** Health data lives here: sensitive under LGPD, never logged or sent elsewhere. */
export const students = pgTable(
  "students",
  {
    userId: owner(),
    id: text("id").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    birthDate: date("birth_date"),
    startedAt: date("started_at").notNull(),
    active: boolean("active").notNull(),
    slotIds: jsonb("slot_ids").$type<string[]>().notNull(),
    health: jsonb("health").$type<Student["health"]>().notNull(),
    attention: text("attention").notNull(),
    goals: text("goals").notNull(),
    evolution: jsonb("evolution").$type<EvolutionNote[]>().notNull(),
    monthlyFee: jsonb("monthly_fee").$type<MonthlyFee>(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

export const bookings = pgTable(
  "bookings",
  {
    userId: owner(),
    id: text("id").notNull(),
    /** no foreign keys: past bookings stay when a slot or student is removed */
    slotId: text("slot_id").notNull(),
    date: date("date").notNull(),
    kind: text("kind").$type<BookingKind>().notNull(),
    status: text("status").$type<BookingStatus>().notNull(),
    studentId: text("student_id"),
    guestName: text("guest_name"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

export const blockedPeriods = pgTable(
  "blocked_periods",
  {
    userId: owner(),
    id: text("id").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    reason: text("reason").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

/** One row per student and month. */
export const payments = pgTable(
  "payments",
  {
    userId: owner(),
    studentId: text("student_id").notNull(),
    month: text("month").notNull(),
    paid: boolean("paid").notNull(),
    paidAt: date("paid_at"),
    amount: money("amount").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.studentId, t.month] })],
);
