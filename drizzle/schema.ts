import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, float } from "drizzle-orm/mysql-core";

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

// Tabela de Veículos
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  plate: varchar("plate", { length: 20 }).notNull().unique(),
  model: varchar("model", { length: 100 }).notNull(),
  capacity: int("capacity").notNull(), // kg
  fuelConsumption: float("fuelConsumption").notNull(), // km/l
  status: mysqlEnum("status", ["available", "in_transit", "maintenance"]).default("available").notNull(),
  currentLatitude: decimal("currentLatitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("currentLongitude", { precision: 11, scale: 8 }),
  currentRegion: varchar("currentRegion", { length: 100 }),
  totalKmRun: int("totalKmRun").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

// Tabela de Pedidos/Entregas
export const deliveries = mysqlTable("deliveries", {
  id: int("id").autoincrement().primaryKey(),
  trackingNumber: varchar("trackingNumber", { length: 50 }).notNull().unique(),
  clientName: varchar("clientName", { length: 150 }).notNull(),
  originCity: varchar("originCity", { length: 100 }).notNull(),
  destinationCity: varchar("destinationCity", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  weight: int("weight").notNull(), // kg
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "collected", "in_transit", "delivered", "delayed", "cancelled"]).default("pending").notNull(),
  vehicleId: int("vehicleId"),
  scheduledDeliveryDate: timestamp("scheduledDeliveryDate").notNull(),
  actualDeliveryDate: timestamp("actualDeliveryDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = typeof deliveries.$inferInsert;

// Tabela de Rotas
export const routes = mysqlTable("routes", {
  id: int("id").autoincrement().primaryKey(),
  routeCode: varchar("routeCode", { length: 50 }).notNull().unique(),
  vehicleId: int("vehicleId").notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  totalDistance: int("totalDistance").notNull(), // km
  totalDeliveries: int("totalDeliveries").default(0).notNull(),
  completedDeliveries: int("completedDeliveries").default(0).notNull(),
  status: mysqlEnum("status", ["planned", "in_progress", "completed", "cancelled"]).default("planned").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

// Tabela de Custos Operacionais
export const operationalCosts = mysqlTable("operationalCosts", {
  id: int("id").autoincrement().primaryKey(),
  vehicleId: int("vehicleId").notNull(),
  costType: mysqlEnum("costType", ["fuel", "maintenance", "toll", "insurance", "salary"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OperationalCost = typeof operationalCosts.$inferSelect;
export type InsertOperationalCost = typeof operationalCosts.$inferInsert;
