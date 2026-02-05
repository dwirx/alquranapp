import { openDB, DBSchema, IDBPDatabase } from "idb";
import { ChatSession } from "@/types/chat";

// Database schema
interface ChatDBSchema extends DBSchema {
  sessions: {
    key: string;
    value: ChatSession;
    indexes: { "by-updated": number };
  };
  models: {
    key: string;
    value: AIModel;
    indexes: { "by-free": number };
  };
  settings: {
    key: string;
    value: SettingValue;
  };
}

// Model type
export interface AIModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
  isFree: boolean;
  created?: number; // Unix timestamp when model was added
}

interface SettingValue {
  key: string;
  value: string | number | boolean;
}

const DB_NAME = "alquran-chat-db";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<ChatDBSchema> | null = null;

// Initialize database
export async function initDB(): Promise<IDBPDatabase<ChatDBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Sessions store
      if (!db.objectStoreNames.contains("sessions")) {
        const sessionStore = db.createObjectStore("sessions", { keyPath: "id" });
        sessionStore.createIndex("by-updated", "updatedAt");
      }

      // Models store
      if (!db.objectStoreNames.contains("models")) {
        const modelStore = db.createObjectStore("models", { keyPath: "id" });
        modelStore.createIndex("by-free", "isFree");
      }

      // Settings store
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    },
  });

  return dbInstance;
}

// Sessions CRUD
export async function getAllSessions(): Promise<ChatSession[]> {
  const db = await initDB();
  const sessions = await db.getAllFromIndex("sessions", "by-updated");
  return sessions.reverse(); // Newest first
}

export async function getSession(id: string): Promise<ChatSession | undefined> {
  const db = await initDB();
  return db.get("sessions", id);
}

export async function saveSession(session: ChatSession): Promise<void> {
  const db = await initDB();
  await db.put("sessions", session);
}

export async function deleteSession(id: string): Promise<void> {
  const db = await initDB();
  await db.delete("sessions", id);
}

export async function clearAllSessions(): Promise<void> {
  const db = await initDB();
  await db.clear("sessions");
}

// Models CRUD
export async function getAllModels(): Promise<AIModel[]> {
  const db = await initDB();
  return db.getAll("models");
}

export async function getFreeModels(): Promise<AIModel[]> {
  const db = await initDB();
  const allModels = await db.getAllFromIndex("models", "by-free");
  return allModels.filter((m) => m.isFree);
}

export async function saveModels(models: AIModel[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction("models", "readwrite");
  await tx.store.clear();
  await Promise.all(models.map((model) => tx.store.put(model)));
  await tx.done;
}

// Settings CRUD
export async function getSetting<T = string>(key: string): Promise<T | undefined> {
  const db = await initDB();
  const result = await db.get("settings", key);
  return result?.value as T | undefined;
}

export async function setSetting<T = string>(key: string, value: T): Promise<void> {
  const db = await initDB();
  await db.put("settings", { key, value: value as string | number | boolean });
}

// Migration from localStorage
export async function migrateFromLocalStorage(): Promise<boolean> {
  const localSessions = localStorage.getItem("ai-chat-sessions");
  const localCurrent = localStorage.getItem("ai-chat-current");

  if (!localSessions) return false;

  try {
    const sessions: ChatSession[] = JSON.parse(localSessions);
    if (sessions.length === 0) return false;

    const db = await initDB();
    const tx = db.transaction("sessions", "readwrite");

    for (const session of sessions) {
      // Add default modelId if not present
      const sessionWithModel = {
        ...session,
        modelId: session.modelId || "openai/gpt-4.1-mini",
      };
      await tx.store.put(sessionWithModel);
    }
    await tx.done;

    // Migrate current session ID
    if (localCurrent) {
      const currentId = JSON.parse(localCurrent);
      if (currentId) {
        await setSetting("currentSessionId", currentId);
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem("ai-chat-sessions");
    localStorage.removeItem("ai-chat-current");

    console.log("[ChatDB] Migrated", sessions.length, "sessions from localStorage");
    return true;
  } catch (error) {
    console.error("[ChatDB] Migration failed:", error);
    return false;
  }
}

// Check if IndexedDB is supported
export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== "undefined";
}
