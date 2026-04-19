import { getAccessToken } from '@modules/aps/aps.service';
import { AUTODEKS_APIS, AUTODESK_BASIC_URL } from '../../apis/autodeskApis';
import { formatHubListData, formatHubData, formatFolderlistsData } from './hubs.domain';

export async function getHubs(accessToken?: string | string[] | undefined) {
  let access_token = accessToken;
  if (!access_token) {
    const accessTokenRes = await getAccessToken();
    access_token = accessTokenRes.access_token;
  }

  const res = fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.HUBS.getHubs}`, {
    headers: { Authorization: `Bearer ${access_token}`, region: 'EMEA' },
  });
  const { data } = await (await res).json();
  return formatHubListData(data);
}

export async function getHubById(id: string, accessToken?: string | string[] | undefined) {
  let access_token = accessToken;
  if (!access_token) {
    const accessTokenRes = await getAccessToken();
    access_token = accessTokenRes.access_token;
  }

  const res = fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.HUBS.getHubById(id)}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const { data } = await (await res).json();

  return formatHubData(data);
}

export async function getProjectFolders(
  hubId: string,
  projectId: string,
  accessToken?: string | string[] | undefined,
) {
  let access_token = accessToken;
  if (!access_token) {
    const accessTokenRes = await getAccessToken();
    access_token = accessTokenRes.access_token;
  }

  const res = fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.HUBS.getProjectFolders(hubId, projectId)}`,
    { headers: { Authorization: `Bearer ${access_token}` } },
  );

  const { data } = await (await res).json();
  return formatFolderlistsData(data);
}
