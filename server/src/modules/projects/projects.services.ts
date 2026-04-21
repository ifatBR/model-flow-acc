import { getApsToken } from '@modules/auth/auth.service';
import { AUTODEKS_APIS, AUTODESK_BASIC_URL } from '../../apis/autodeskApis';
import { formatFolderContents } from '@modules/hubs/hubs.domain';

export async function getFolderContent(projectId: string, folderId: string) {
  const accessToken = await getApsToken();

  const res = fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.PROJECTS.getFolderContent(projectId, folderId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  const { data } = await (await res).json();
  return formatFolderContents(data);
}

export async function getItemVersions(projectId: string, itemId: string) {
  const accessToken = await getApsToken();
  const res = fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.PROJECTS.getItemVersions(projectId, itemId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  const { data } = await (await res).json();
  return data;
}
