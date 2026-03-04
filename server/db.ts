import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, vehicles, deliveries, routes, operationalCosts, InsertVehicle, InsertDelivery, InsertRoute, InsertOperationalCost } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== VEHICLES QUERIES =====
export async function createVehicle(vehicle: InsertVehicle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vehicles).values(vehicle);
  return result;
}

export async function getAllVehicles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(vehicles);
}

export async function getVehicleById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(vehicles).where(eq(vehicles.id, id));
  return result[0];
}

export async function updateVehicleStatus(id: number, status: string, latitude?: string, longitude?: string, region?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Record<string, any> = { status, updatedAt: new Date() };
  if (latitude) updates.currentLatitude = latitude;
  if (longitude) updates.currentLongitude = longitude;
  if (region) updates.currentRegion = region;
  return await db.update(vehicles).set(updates).where(eq(vehicles.id, id));
}

// ===== DELIVERIES QUERIES =====
export async function createDelivery(delivery: InsertDelivery) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(deliveries).values(delivery);
}

export async function getAllDeliveries() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(deliveries).orderBy(desc(deliveries.createdAt));
}

export async function getDeliveriesByStatus(status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(deliveries).where(eq(deliveries.status, status as any));
}

export async function getDeliveriesByRegion(region: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(deliveries).where(eq(deliveries.region, region));
}

export async function updateDeliveryStatus(id: number, status: string, actualDeliveryDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Record<string, any> = { status, updatedAt: new Date() };
  if (actualDeliveryDate) updates.actualDeliveryDate = actualDeliveryDate;
  return await db.update(deliveries).set(updates).where(eq(deliveries.id, id));
}

export async function getDeliveriesByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(deliveries).where(
    and(
      gte(deliveries.createdAt, startDate),
      lte(deliveries.createdAt, endDate)
    )
  );
}

// ===== ROUTES QUERIES =====
export async function createRoute(route: InsertRoute) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(routes).values(route);
}

export async function getAllRoutes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(routes).orderBy(desc(routes.createdAt));
}

export async function getRoutesByVehicle(vehicleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(routes).where(eq(routes.vehicleId, vehicleId));
}

export async function updateRouteStatus(id: number, status: string, completedDeliveries?: number, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Record<string, any> = { status, updatedAt: new Date() };
  if (completedDeliveries !== undefined) updates.completedDeliveries = completedDeliveries;
  if (endDate) updates.endDate = endDate;
  return await db.update(routes).set(updates).where(eq(routes.id, id));
}

// ===== OPERATIONAL COSTS QUERIES =====
export async function createOperationalCost(cost: InsertOperationalCost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(operationalCosts).values(cost);
}

export async function getCostsByVehicle(vehicleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(operationalCosts).where(eq(operationalCosts.vehicleId, vehicleId));
}

export async function getCostsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(operationalCosts).where(
    and(
      gte(operationalCosts.date, startDate),
      lte(operationalCosts.date, endDate)
    )
  );
}

// ===== KPI CALCULATIONS =====
export async function calculateOTD(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const deliveredOnTime = await db.select({ count: sql<number>`COUNT(*)` })
    .from(deliveries)
    .where(
      and(
        eq(deliveries.status, "delivered" as any),
        gte(deliveries.createdAt, startDate),
        lte(deliveries.createdAt, endDate),
        sql`DATE(${deliveries.actualDeliveryDate}) <= DATE(${deliveries.scheduledDeliveryDate})`
      )
    );
  
  const totalDelivered = await db.select({ count: sql<number>`COUNT(*)` })
    .from(deliveries)
    .where(
      and(
        eq(deliveries.status, "delivered" as any),
        gte(deliveries.createdAt, startDate),
        lte(deliveries.createdAt, endDate)
      )
    );
  
  const onTimeCount = deliveredOnTime[0]?.count || 0;
  const totalCount = totalDelivered[0]?.count || 1;
  
  return (onTimeCount / totalCount) * 100;
}

export async function calculateAverageDeliveryTime(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    avgTime: sql<number>`AVG(TIMESTAMPDIFF(HOUR, ${deliveries.createdAt}, ${deliveries.actualDeliveryDate}))`
  })
  .from(deliveries)
  .where(
    and(
      eq(deliveries.status, "delivered" as any),
      gte(deliveries.createdAt, startDate),
      lte(deliveries.createdAt, endDate)
    )
  );
  
  return result[0]?.avgTime || 0;
}

export async function calculateTotalRevenue(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    total: sql<number>`SUM(${deliveries.value})`
  })
  .from(deliveries)
  .where(
    and(
      eq(deliveries.status, "delivered" as any),
      gte(deliveries.createdAt, startDate),
      lte(deliveries.createdAt, endDate)
    )
  );
  
  return parseFloat(result[0]?.total?.toString() || "0");
}

export async function calculateTotalOperationalCosts(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    total: sql<number>`SUM(${operationalCosts.amount})`
  })
  .from(operationalCosts)
  .where(
    and(
      gte(operationalCosts.date, startDate),
      lte(operationalCosts.date, endDate)
    )
  );
  
  return parseFloat(result[0]?.total?.toString() || "0");
}
