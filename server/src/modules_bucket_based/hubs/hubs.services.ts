import { listObjects } from '../bucket/bucket.services';
import {
  formatBucketAsHub,
  formatBucketAsProjects,
  formatBucketAsTopFolders,
  formatObjectsAsItems,
  formatObjectsAsVersions,
} from './hubs.domain';

export async function getBucketAsHubs() {
  const bucketKey = process.env.BUCKET_KEY;
  if (!bucketKey) throw new Error('Missing BUCKET_KEY environment variable');
  const displayName = process.env.BUCKET_DISPLAY_NAME ?? bucketKey;
  return formatBucketAsHub(bucketKey, displayName);
}

export async function getBucketAsProjects(_bucketKey: string) {
  return formatBucketAsProjects();
}

export async function getBucketTopFolders(_bucketKey: string, _projectId: string) {
  const objects = await listObjects();
  return formatBucketAsTopFolders(objects);
}

export async function getBucketFolderContents(_projectId: string, _folderId: string) {
  const objects = await listObjects();
  return formatObjectsAsItems(objects);
}

export async function getBucketItemVersions(_projectId: string, itemId: string) {
  const objects = await listObjects();
  return formatObjectsAsVersions(objects, itemId);
}
