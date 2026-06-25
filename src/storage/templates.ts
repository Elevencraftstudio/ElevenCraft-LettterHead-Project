import { getDatabase } from './database';

export interface TemplateRecord {
  id: string;
  name: string;
  category: string;
  data: Record<string, unknown>;
  previewUrl?: string;
  isBuiltIn: boolean;
  createdAt: number;
  updatedAt: number;
}

export async function getAllTemplates(): Promise<TemplateRecord[]> {
  const db = await getDatabase();
  const templates = await db.getAll('templates');
  return templates.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTemplatesByCategory(category: string): Promise<TemplateRecord[]> {
  const db = await getDatabase();
  const templates = await db.getAll('templates');
  return templates.filter((t) => t.category === category).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTemplate(id: string): Promise<TemplateRecord | undefined> {
  const db = await getDatabase();
  return db.get('templates', id);
}

export async function saveTemplate(template: TemplateRecord): Promise<void> {
  const db = await getDatabase();
  await db.put('templates', { ...template, updatedAt: Date.now() });
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDatabase();
  await db.delete('templates', id);
}

export async function clearAllTemplates(): Promise<void> {
  const db = await getDatabase();
  await db.clear('templates');
}
