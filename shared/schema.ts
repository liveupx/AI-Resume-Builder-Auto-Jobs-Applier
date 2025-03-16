import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("seeker"), // seeker, agency, admin
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier"), // free, basic, premium
  companyName: text("company_name"),
  companyLogo: text("company_logo"),
  companyDescription: text("company_description"),
  location: text("location"),
  jobPreferences: jsonb("job_preferences"), // desired titles, locations, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  template: text("template").notNull(),
  score: integer("score"), // AI-generated resume score
  suggestions: jsonb("suggestions"), // AI-generated improvement suggestions
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  salary: text("salary"),
  type: text("type").notNull(), // full-time, part-time, contract
  source: text("source"), // direct, twitter
  sourceUrl: text("source_url"), // original job posting URL
  status: text("status").notNull().default("active"), // active, filled, expired
  applicationsCount: integer("applications_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  resumeId: integer("resume_id").references(() => resumes.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const twitterJobs = pgTable("twitter_jobs", {
  id: serial("id").primaryKey(),
  tweetId: text("tweet_id").notNull().unique(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  parsedTitle: text("parsed_title"),
  parsedCompany: text("parsed_company"),
  parsedLocation: text("parsed_location"),
  processed: boolean("processed").default(false),
  jobId: integer("job_id").references(() => jobs.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  companyName: true,
  companyLogo: true,
  companyDescription: true,
  location: true,
  jobPreferences: true,
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  title: true,
  content: true,
  template: true,
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  company: true,
  location: true,
  description: true,
  requirements: true,
  salary: true,
  type: true,
  source: true,
  sourceUrl: true,
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  jobId: true,
  resumeId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type TwitterJob = typeof twitterJobs.$inferSelect;