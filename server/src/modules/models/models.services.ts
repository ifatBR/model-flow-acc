import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';

// Resolves to server/data/models/ relative to this compiled file in dist/modules/models/
const DATA_DIR = join(__dirname, '..', '..', '..', 'data', 'models');

function sanitizeItemId(itemId: string): string {
  return itemId.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function getVersionElements(itemId: string, versionNumber: number) {
  const dir = join(DATA_DIR, sanitizeItemId(itemId), `v${versionNumber}`);

  try {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.json')).sort();

    const chunks = await Promise.all(
      files.map(async (file) => {
        const content = await readFile(join(dir, file), 'utf-8');
        return JSON.parse(content);
      }),
    );

    return chunks.flat();
  } catch {
    return [];
  }
}

export async function saveVersionElements(
  itemId: string,
  versionNumber: number,
  elements: unknown[],
) {
  const dir = join(DATA_DIR, sanitizeItemId(itemId));
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `v${versionNumber}.json`);
  await writeFile(filePath, JSON.stringify(elements, null, 2), 'utf-8');
}

export async function saveVersionElementsChunks(
  itemId: string,
  versionNumber: number,
  body: { chunkIndex: number; isLastChunk: boolean; elements: unknown[] },
) {
  const dir = join(DATA_DIR, sanitizeItemId(itemId), `v${versionNumber}`);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `chunk-${body.chunkIndex}.json`);
  await writeFile(filePath, JSON.stringify(body.elements), 'utf-8');
}
