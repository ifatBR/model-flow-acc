import { getAccessToken } from '@modules/aps/aps.service';
import { AUTODEKS_APIS, AUTODESK_BASIC_URL } from '../../apis/autodeskApis';
import { formatFolderContents } from '@modules/hubs/hubs.domain';

export async function getFolderContent(
  projectId: string,
  folderId: string,
  accessToken: string | string[] | undefined,
) {
  let access_token = accessToken;
  if (!access_token) {
    const accessTokenRes = await getAccessToken();
    access_token = accessTokenRes.access_token;
  }
  const res = fetch(
    `${AUTODESK_BASIC_URL}${AUTODEKS_APIS.PROJECTS.getFolderContent(projectId, folderId)}`,
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );

  const { data } = await (await res).json();
  return formatFolderContents(data);
}
