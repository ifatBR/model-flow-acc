import type { FormattedObject } from '../bucket/bucket.domain';
import { groupByBaseName, parseVersionedKey } from '../bucket/bucket.domain';

export function formatBucketAsHub(bucketKey: string, displayName: string) {
  return [{ id: bucketKey, name: displayName }];
}

export function formatBucketAsProjects() {
  return [{ id: 'default', name: 'Models' }];
}

export function formatBucketAsTopFolders(objects: FormattedObject[]) {
  const nonEmpty = objects.filter((o) => parseVersionedKey(o.objectKey) !== null);
  const latest = nonEmpty.reduce(
    (acc, o) => (o.objectKey > acc ? o.objectKey : acc),
    '',
  );
  return [
    {
      id: 'root',
      name: 'Files',
      ct: '',
      mt: latest,
      objectCount: groupByBaseName(nonEmpty).size,
    },
  ];
}

export function formatObjectsAsItems(objects: FormattedObject[]) {
  // Versioned files: {baseName}_v{N}.{ext} — grouped by base name
  const grouped = groupByBaseName(objects);
  const versionedItems = Array.from(grouped.entries()).map(([baseName, versions]) => {
    const sorted = [...versions].sort((a, b) => {
      const va = parseVersionedKey(a.objectKey)?.version ?? 0;
      const vb = parseVersionedKey(b.objectKey)?.version ?? 0;
      return vb - va;
    });
    return {
      type: 'items' as const,
      id: baseName,
      name: baseName,
      ct: '',
      mt: '',
      latestObjectId: sorted[0].objectId,
    };
  });

  // Non-versioned files already in the bucket — shown as single-version items
  const nonVersionedItems = objects
    .filter((o) => parseVersionedKey(o.objectKey) === null)
    .map((o) => ({
      type: 'items' as const,
      id: o.objectKey,
      name: o.objectKey,
      ct: '',
      mt: '',
      latestObjectId: o.objectId,
    }));

  return [...versionedItems, ...nonVersionedItems];
}

export function formatObjectsAsVersions(objects: FormattedObject[], itemId: string) {
  // Try versioned match: {itemId}_v{N}.{ext}
  const versioned = objects
    .map((o) => {
      const parsed = parseVersionedKey(o.objectKey);
      if (!parsed || parsed.baseName !== itemId) return null;
      return {
        type: 'versions' as const,
        id: o.objectId,
        versionNumber: parsed.version,
        displayName: o.objectKey,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)
    .sort((a, b) => b.versionNumber - a.versionNumber);

  if (versioned.length > 0) return versioned;

  // Fall back: exact objectKey match for non-versioned files already in bucket
  const exact = objects.find((o) => o.objectKey === itemId);
  if (exact) {
    return [{ type: 'versions' as const, id: exact.objectId, versionNumber: 1, displayName: exact.objectKey }];
  }

  return [];
}
