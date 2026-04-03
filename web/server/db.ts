import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, anomalies, InsertAnomaly, searchHistory, InsertSearchHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// Anomaly database functions
export async function getAllAnomalies() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(anomalies).orderBy(desc(anomalies.detectedAt));
}

export async function getAnomalyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(anomalies).where(eq(anomalies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAnomalyByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(anomalies).where(eq(anomalies.externalId, externalId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAnomaly(anomaly: InsertAnomaly) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(anomalies).values(anomaly);
  return result;
}

export async function updateAnomaly(id: number, updates: Partial<InsertAnomaly>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(anomalies).set(updates).where(eq(anomalies.id, id));
}

export async function getAnomaliesByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(anomalies).where(eq(anomalies.status, status as any)).orderBy(desc(anomalies.detectedAt));
}

export async function getAnomaliesBySeverity(severity: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(anomalies).where(eq(anomalies.severity, severity as any)).orderBy(desc(anomalies.detectedAt));
}

export async function getAnomaliesByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(anomalies).where(eq(anomalies.type, type as any)).orderBy(desc(anomalies.detectedAt));
}

export async function getAnomalyStats() {
  const db = await getDb();
  if (!db) return {
    total: 0,
    resolved: 0,
    pending: 0,
    bySeverity: {},
    byType: {},
    byStatus: {}
  };
  
  const allAnomalies = await db.select().from(anomalies);
  
  const stats = {
    total: allAnomalies.length,
    resolved: allAnomalies.filter(a => a.status === 'resolved').length,
    pending: allAnomalies.filter(a => a.status !== 'resolved' && a.status !== 'ignored').length,
    bySeverity: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>
  };
  
  allAnomalies.forEach(anomaly => {
    stats.bySeverity[anomaly.severity] = (stats.bySeverity[anomaly.severity] || 0) + 1;
    stats.byType[anomaly.type] = (stats.byType[anomaly.type] || 0) + 1;
    stats.byStatus[anomaly.status] = (stats.byStatus[anomaly.status] || 0) + 1;
  });
  
  return stats;
}

// Search history functions
export async function addSearchHistory(search: InsertSearchHistory) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(searchHistory).values(search);
}

export async function getUserSearchHistory(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(searchHistory).where(eq(searchHistory.userId, userId)).orderBy(desc(searchHistory.createdAt)).limit(limit);
}
