import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["ADMIN", "GM", "AM"]);
export const customerStatusEnum = pgEnum("customer_status", [
  "Prospect",
  "On Going",
  "Negotiation",
  "Closed Won",
  "Closed Lost"
]);

export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
});

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull(),
  departmentId: integer("department_id").references(() => departments.id, { onDelete: "set null" }),
  gmId: integer("gm_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const targets = pgTable("targets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  period: varchar("period", { length: 7 }).notNull(),
  amountRp: decimal("amount_rp", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  amId: integer("am_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  pic: text("pic").notNull(),
  contact: text("contact").notNull(),
  potentialRp: decimal("potential_rp", { precision: 15, scale: 2 }).notNull(),
  estCloseDate: date("est_close_date"),
  status: customerStatusEnum("status").notNull().default("Prospect"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const progresses = pgTable("progresses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  amId: integer("am_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  note: text("note").notNull(),
  status: customerStatusEnum("status").notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  gm: one(users, {
    fields: [users.gmId],
    references: [users.id],
    relationName: "gm_to_am",
  }),
  ams: many(users, {
    relationName: "gm_to_am",
  }),
  targets: many(targets),
  customers: many(customers),
  progresses: many(progresses),
}));

export const targetsRelations = relations(targets, ({ one }) => ({
  user: one(users, {
    fields: [targets.userId],
    references: [users.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  am: one(users, {
    fields: [customers.amId],
    references: [users.id],
  }),
  progresses: many(progresses),
}));

export const progressesRelations = relations(progresses, ({ one }) => ({
  customer: one(customers, {
    fields: [progresses.customerId],
    references: [customers.id],
  }),
  am: one(users, {
    fields: [progresses.amId],
    references: [users.id],
  }),
}));

export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const selectDepartmentSchema = createSelectSchema(departments);

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});
export const selectUserSchema = createSelectSchema(users);

export const insertTargetSchema = createInsertSchema(targets).omit({ 
  id: true, 
  createdAt: true 
});
export const selectTargetSchema = createSelectSchema(targets);

export const insertCustomerSchema = createInsertSchema(customers).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectCustomerSchema = createSelectSchema(customers);

export const insertProgressSchema = createInsertSchema(progresses).omit({ 
  id: true, 
  createdAt: true 
});
export const selectProgressSchema = createSelectSchema(progresses);

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Target = typeof targets.$inferSelect;
export type InsertTarget = z.infer<typeof insertTargetSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Progress = typeof progresses.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;

export type CustomerStatus = "Prospect" | "On Going" | "Negotiation" | "Closed Won" | "Closed Lost";
export type Role = "ADMIN" | "GM" | "AM";
