import { getDatabase } from './database';

export interface ProjectRecord {
  id: string;
  title: string;
  docMode: string;
  category: string;
  data: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  isDraft?: boolean;
}

export async function getAllProjects(): Promise<ProjectRecord[]> {
  const db = await getDatabase();
  const records = await db.getAll('projects');
  return records.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<ProjectRecord | undefined> {
  const db = await getDatabase();
  return db.get('projects', id);
}

export async function saveProject(project: ProjectRecord): Promise<void> {
  const db = await getDatabase();
  await db.put('projects', { ...project, updatedAt: Date.now() });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('projects', id);
}

export async function searchProjects(query: string): Promise<ProjectRecord[]> {
  const db = await getDatabase();
  const records = await db.getAll('projects');
  const lower = query.toLowerCase();
  return records
    .filter((p) => p.title.toLowerCase().includes(lower))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProjectCount(): Promise<number> {
  const db = await getDatabase();
  return db.count('projects');
}

export async function clearAllProjects(): Promise<void> {
  const db = await getDatabase();
  await db.clear('projects');
}

export async function getUnsyncedProjects(): Promise<ProjectRecord[]> {
  const db = await getDatabase();
  const records = await db.getAll('projects');
  return records.filter((r) => !r.syncedAt || r.syncedAt < r.updatedAt);
}
