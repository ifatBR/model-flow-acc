import { AUTODESK_BASIC_URL, AUTODEKS_APIS } from '../../apis/autodeskApis';
const BUCKET_KEY = 'ifat-test-bucket-123456';

export async function getAccessToken() {
  const basic = Buffer.from(
    `${process.env.APS_CLIENT_ID}:${process.env.APS_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.getToken}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'data:read data:write data:create bucket:create bucket:read',
    }),
  });

  return res.json();
}

export async function createBucket() {
  const { access_token } = await getAccessToken();
  const res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.createBucket}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      region: 'EMEA',
    },
    body: JSON.stringify({
      bucketKey: BUCKET_KEY,
      policyKey: 'transient',
    }),
  });

  const data = await res.json();

  return data;
}

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  accessToken?: string | string[] | undefined,
) {
  let access_token = accessToken;
  if (!access_token) {
    const accessTokenRes = await getAccessToken();
    access_token = accessTokenRes.access_token;
  }

  const bucketKey = BUCKET_KEY;
  const getRes = await fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.getSignedS3Upload(bucketKey, fileName)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  const getData = await getRes.json();

  const { uploadKey, urls } = getData;

  const s3Res = await fetch(urls[0], {
    method: 'PUT',
    body: new Uint8Array(fileBuffer),
  });

  if (!s3Res.ok) {
    throw new Error(`s3 upload fialed ${s3Res.status} ${s3Res.text()}`);
  }

  const res = await fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.getSignedS3Upload(bucketKey, fileName)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uploadKey }),
    },
  );
  const data = await res.json();

  return data;
}

export async function listObjects() {
  const { access_token } = await getAccessToken();
  const bucketKey = BUCKET_KEY;

  const res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.listObjects(bucketKey)}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return res.json();
}

export async function translateObject(
  objectId: string,
  accessToken?: string | string[] | undefined,
) {
  let access_token = accessToken;
  if (!access_token) {
    const accessTokenRes = await getAccessToken();
    access_token = accessTokenRes.access_token;
  }

  const urn = Buffer.from(objectId).toString('base64');

  const res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.translateObject}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { urn },
      output: {
        formats: [{ type: 'svf', views: ['2d', '3d'] }],
      },
    }),
  });

  const data = await res.json();
  console.log('translate:', data);

  return { urn };
}

export async function getManifest(urn: string, accessToken?: string | string[] | undefined) {
  let access_token = accessToken;

  if (!access_token) {
    const accessTokenRes = await getAccessToken();
    access_token = accessTokenRes.access_token;
  }

  const res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.getManifest(urn)}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return res.json();
}

export async function uploadUserModel(
  fileBuffer: Buffer,
  fileName: string,
  accessToken: string | string[] | undefined,
) {
  const fileData = await uploadFile(fileBuffer, fileName, accessToken);
  console.log('>>>>fileData:', fileData);
  const { objectId } = fileData;
  const translatedFile = await translateObject(objectId, accessToken);
  const { urn } = translatedFile;
  return { urn };
}
