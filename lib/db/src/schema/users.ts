import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Application user record, keyed by the Clerk user id. This is the only
// app-owned table for accounts + entitlement; everything Stripe-owned
// (customers, prices, checkout sessions, payments) lives in the `stripe`
// schema that stripe-replit-sync manages — we never duplicate it here.
//
// `hasPaid` is the cached one-time-unlock flag. It is the durable record of a
// completed $10 purchase, set after the checkout session is verified against
// Stripe (see the billing routes). `stripeCustomerId` ties this account to its
// Stripe customer so repeat checkouts reuse one customer.
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  hasPaid: boolean("has_paid").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
