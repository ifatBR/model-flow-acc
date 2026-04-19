import { getAccessToken, uploadFile } from '@modules/aps/aps.service';
import { AUTODEKS_APIS, AUTODESK_BASIC_URL } from '../../apis/autodeskApis';

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

  const res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.DERIVIATIVE.translateObject}`, {
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

  return { urn };
}

export async function getManifest(urn: string, accessToken?: string | string[] | undefined) {
  let access_token = accessToken;

  if (!access_token) {
    const accessTokenRes = await getAccessToken();
    access_token = accessTokenRes.access_token;
  }

  const res = await fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.DERIVIATIVE.getManifest(urn)}`, {
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
  const { objectId } = fileData;
  const translatedFile = await translateObject(objectId, accessToken);
  const { urn } = translatedFile;
  return { urn };
}
