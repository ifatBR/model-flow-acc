import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Resolves to server/data/models/ relative to this compiled file in dist/modules/models/
const DATA_DIR = join(__dirname, '..', '..', '..', 'data', 'models');

function sanitizeItemId(itemId: string): string {
  return itemId.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function getVersionElements(itemId: string, versionNumber: number) {
  const filePath = join(DATA_DIR, sanitizeItemId(itemId), `v${versionNumber}.json`);
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function saveVersionElements(itemId: string, versionNumber: number, elements: unknown[]) {
  const dir = join(DATA_DIR, sanitizeItemId(itemId));
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `v${versionNumber}.json`);
  await writeFile(filePath, JSON.stringify(elements, null, 2), 'utf-8');
}
