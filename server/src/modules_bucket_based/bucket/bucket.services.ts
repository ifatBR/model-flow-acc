import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getApsToken } from '@modules/auth/auth.service';
import { AUTODESK_BASIC_URL, AUTODEKS_APIS } from '../../apis/autodeskApis';
import { formattedObjects, nextVersionNumber, versionedKey } from './bucket.domain';
import { translateObject } from '@modules/deriviative/deriviative.services';

const PAGINATION_LIMIT = 50;
const ASSETS_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'assets');

function getBucketKey(): string {
  const key = process.env.BUCKET_KEY;
  if (!key) throw new Error('Missing BUCKET_KEY environment variable');
  return key;
}

async function ensureBucketExists(bucketKey: string, accessToken: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.listBuckets}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        region: 'EMEA',
      },
    });
  } catch (err) {
    throw new Error(`Network error listing buckets: ${err}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to list buckets: ${res.status} ${body}`);
  }

  const data: { items: { bucketKey: string }[] } = await res.json().catch(() => {
    throw new Error('Invalid JSON in list buckets response');
  });

  if (data.items.some((b) => b.bucketKey === bucketKey)) return;

  let createRes: Response;
  try {
    createRes = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.createBucket}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        region: 'EMEA',
      },
      body: JSON.stringify({ bucketKey, policyKey: 'persistent' }),
    });
  } catch (err) {
    throw new Error(`Network error creating bucket: ${err}`);
  }

  if (!createRes.ok) {
    const body = await createRes.text().catch(() => '');
    throw new Error(`Failed to create bucket: ${createRes.status} ${body}`);
  }
}

export async function listObjects() {
  const accessToken = await getApsToken();
  const bucketKey = getBucketKey();

  let res: Response;
  try {
    res = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.listObjects(bucketKey)}?limit=${PAGINATION_LIMIT}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          region: 'EMEA',
        },
      },
    );
  } catch (err) {
    throw new Error(`Network error listing objects: ${err}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to list objects: ${res.status} ${body}`);
  }

  const { items } = await res.json().catch(() => {
    throw new Error('Invalid JSON in list objects response');
  });

  return formattedObjects(items).sort((a, b) => a.objectKey.localeCompare(b.objectKey));
}

export async function uploadFile(fileBuffer: Buffer, fileName: string) {
  const accessToken = await getApsToken();
  const bucketKey = getBucketKey();

  await ensureBucketExists(bucketKey, accessToken);

  const dotIndex = fileName.lastIndexOf('.');
  const baseName = dotIndex > -1 ? fileName.slice(0, dotIndex) : fileName;
  const ext = dotIndex > -1 ? fileName.slice(dotIndex) : '';

  const existingObjects = await listObjects();
  const version = nextVersionNumber(existingObjects, baseName, ext);
  const objectKey = versionedKey(baseName, version, ext);

  let getRes: Response;
  try {
    getRes = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.getSignedS3Upload(bucketKey, objectKey)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          region: 'EMEA',
        },
      },
    );
  } catch (err) {
    throw new Error(`Network error fetching signed upload URL: ${err}`);
  }

  if (!getRes.ok) {
    const body = await getRes.text().catch(() => '');
    throw new Error(`Failed to get signed upload URL: ${getRes.status} ${body}`);
  }

  const { uploadKey, urls }: { uploadKey: string; urls: string[] } = await getRes
    .json()
    .catch(() => {
      throw new Error('Invalid JSON in signed upload URL response');
    });

  let s3Res: Response;
  try {
    s3Res = await fetch(urls[0], {
      method: 'PUT',
      body: new Uint8Array(fileBuffer),
    });
  } catch (err) {
    throw new Error(`Network error uploading to S3: ${err}`);
  }

  if (!s3Res.ok) {
    const body = await s3Res.text().catch(() => '');
    throw new Error(`S3 upload failed: ${s3Res.status} ${body}`);
  }

  let completeRes: Response;
  try {
    completeRes = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.getSignedS3Upload(bucketKey, objectKey)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          region: 'EMEA',
        },
        body: JSON.stringify({ uploadKey }),
      },
    );
  } catch (err) {
    throw new Error(`Network error completing upload: ${err}`);
  }

  if (!completeRes.ok) {
    const body = await completeRes.text().catch(() => '');
    throw new Error(`Failed to complete upload: ${completeRes.status} ${body}`);
  }

  const result = await completeRes.json().catch(() => {
    throw new Error('Invalid JSON in complete upload response');
  });

  translateObject(result.objectId).catch(() => {});

  return result;
}

export async function deleteObject(objectKey: string) {
  const accessToken = await getApsToken();
  const bucketKey = getBucketKey();

  let res: Response;
  try {
    res = await fetch(
      `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.OSS.deleteObject(bucketKey, encodeURIComponent(objectKey))}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          region: 'EMEA',
        },
      },
    );
  } catch (err) {
    throw new Error(`Network error deleting object: ${err}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to delete object: ${res.status} ${body}`);
  }

  return { success: true };
}

export async function createNewFolder(folderName: string) {
  const fileBuffer = await readFile(path.join(ASSETS_DIR, '.placeholder'));
  return uploadFile(fileBuffer, encodeURIComponent(folderName));
}
