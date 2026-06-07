export interface FormattedObject {
  objectId: string;
  objectKey: string;
  size: number;
  bucketKey: string;
}

export function formattedObjects(rawItems: any[]): FormattedObject[] {
  return rawItems.map((item) => ({
    objectId: item.objectId as string,
    objectKey: item.objectKey as string,
    size: item.size as number,
    bucketKey: item.bucketKey as string,
  }));
}

const VERSION_REGEX = /^(.+)_v(\d+)(\..+)$/;

export function parseVersionedKey(objectKey: string): { baseName: string; version: number; ext: string } | null {
  const match = VERSION_REGEX.exec(objectKey);
  if (!match) return null;
  return { baseName: match[1], version: parseInt(match[2], 10), ext: match[3] };
}

export function groupByBaseName(objects: FormattedObject[]): Map<string, FormattedObject[]> {
  const map = new Map<string, FormattedObject[]>();
  for (const obj of objects) {
    const parsed = parseVersionedKey(obj.objectKey);
    if (!parsed) continue;
    const existing = map.get(parsed.baseName) ?? [];
    existing.push(obj);
    map.set(parsed.baseName, existing);
  }
  return map;
}

export function nextVersionNumber(objects: FormattedObject[], baseName: string, ext: string): number {
  const existing = objects
    .map((o) => parseVersionedKey(o.objectKey))
    .filter((p) => p !== null && p.baseName === baseName && p.ext === ext)
    .map((p) => p!.version);
  return existing.length === 0 ? 1 : Math.max(...existing) + 1;
}

export function versionedKey(baseName: string, version: number, ext: string): string {
  return `${baseName}_v${version}${ext}`;
}
