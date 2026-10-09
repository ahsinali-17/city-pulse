import Dexie, { type Table } from "dexie";
import { type FieldTask } from "@/lib/mock-data";

export interface PendingSyncItem {
  id?: number;
  ticketId: string;
  newStatus: string;
  partsNeeded: string[];
  partsUsed: string[];
  timestamp: number;
}

export class CityPulseOfflineDB extends Dexie {
  tasks!: Table<FieldTask, string>;
  pendingSync!: Table<PendingSyncItem, number>;

  constructor() {
    super("CityPulseOfflineDB");
    this.version(1).stores({
      tasks: "id, status, priority",
      pendingSync: "++id, ticketId, timestamp",
    });
  }
}

export const offlineDB =
  typeof window !== "undefined" ? new CityPulseOfflineDB() : null;

export async function cacheTasksLocally(tasks: FieldTask[]) {
  if (!offlineDB) return;
  try {
    // The cache is scoped to the currently signed-in worker. Remove tasks
    // from a previous worker before writing this worker's assignments.
    await offlineDB.tasks.clear();
    await offlineDB.tasks.bulkPut(tasks);
  } catch (error) {
    console.error("Failed to cache tasks in Dexie:", error);
  }
}

export async function queueOfflineUpdate(
  ticketId: string,
  newStatus: string,
  partsNeeded: string[],
  partsUsed: string[]
) {
  if (!offlineDB) return;
  try {
    // 1. Update task in local IndexedDB immediately
    const existingTask = await offlineDB.tasks.get(ticketId);
    if (existingTask) {
      await offlineDB.tasks.put({
        ...existingTask,
        status: newStatus as FieldTask["status"],
        partsNeeded,
        partsUsed,
      });
    }

    // 2. Add mutation to pendingSync queue
    await offlineDB.pendingSync.add({
      ticketId,
      newStatus,
      partsNeeded,
      partsUsed,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to queue offline update in Dexie:", error);
  }
}

export async function clearPendingSyncItem(id: number) {
  if (!offlineDB) return;
  try {
    await offlineDB.pendingSync.delete(id);
  } catch (error) {
    console.error("Failed to clear sync item:", error);
  }
}
