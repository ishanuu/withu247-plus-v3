import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Chat history for RAG-powered conversations
export const chatHistory = mysqlTable("chat_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  role: varchar("role", { length: 10 }).notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  sentiment: varchar("sentiment", { length: 20 }), // 'positive', 'negative', 'neutral'
  sentimentScore: int("sentimentScore"), // 0-100
  sources: text("sources"), // JSON array of research sources
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatHistory.$inferSelect;
export type InsertChatMessage = typeof chatHistory.$inferInsert;

// Emotion detection logs
export const emotionLogs = mysqlTable("emotion_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  dominantEmotion: varchar("dominantEmotion", { length: 20 }).notNull(),
  emotionProbs: text("emotionProbs").notNull(), // JSON object
  negativeEmotionScore: int("negativeEmotionScore"), // 0-100
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmotionLog = typeof emotionLogs.$inferSelect;
export type InsertEmotionLog = typeof emotionLogs.$inferInsert;

// Symptom analysis records
export const symptomRecords = mysqlTable("symptom_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  symptom: varchar("symptom", { length: 255 }).notNull(),
  possibleConditions: text("possibleConditions").notNull(), // JSON array
  severityScore: int("severityScore"), // 0-100
  riskClassification: varchar("riskClassification", { length: 20 }), // 'low', 'medium', 'high'
  pubmedSources: text("pubmedSources").notNull(), // JSON array
  recommendedNextSteps: text("recommendedNextSteps"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SymptomRecord = typeof symptomRecords.$inferSelect;
export type InsertSymptomRecord = typeof symptomRecords.$inferInsert;

// Doctor specialty mappings
export const doctorMappings = mysqlTable("doctor_mappings", {
  id: int("id").autoincrement().primaryKey(),
  symptom: varchar("symptom", { length: 255 }).notNull().unique(),
  specialty: varchar("specialty", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DoctorMapping = typeof doctorMappings.$inferSelect;
export type InsertDoctorMapping = typeof doctorMappings.$inferInsert;