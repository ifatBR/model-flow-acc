import { readFile } from 'fs/promises';
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
