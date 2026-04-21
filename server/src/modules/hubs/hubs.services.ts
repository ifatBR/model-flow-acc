import { getApsToken } from '@modules/auth/auth.service';
import { AUTODEKS_APIS, AUTODESK_BASIC_URL } from '../../apis/autodeskApis';
import { formatHubListData, formatHubData, formatFolderlistsData } from './hubs.domain';

export async function getHubs() {
  const accessToken = await getApsToken();

  const res = fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.HUBS.getHubs}`, {
    headers: { Authorization: `Bearer ${accessToken}`, region: 'EMEA' },
  });
  const { data } = await (await res).json();
  return formatHubListData(data);
}

export async function getHubById(id: string) {
  const accessToken = await getApsToken();

  const res = fetch(`${AUTODESK_BASIC_URL}${AUTODEKS_APIS.HUBS.getHubById(id)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const { data } = await (await res).json();

  return formatHubData(data);
}

export async function getProjectFolders(hubId: string, projectId: string) {
  const accessToken = await getApsToken();

  const res = fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.HUBS.getProjectFolders(hubId, projectId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  const { data } = await (await res).json();
  return formatFolderlistsData(data);
}
