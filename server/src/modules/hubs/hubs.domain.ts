export const formatHubListData = (rawData: any) => {
  return rawData
    .filter(({ type }: { type: string }) => type === 'hubs')
    .map(({ id, attributes }: { id: string; attributes: any }) => ({ id, name: attributes.name }));
};

export const formatHubData = (rawData: any) => {
  return rawData
    .filter(({ type }: { type: string }) => type === 'projects')
    .map(({ id, attributes }: { id: string; attributes: any }) => ({ id, name: attributes.name }));
};

export const formatFolderlistsData = (rawData: any) => {
  const userFiles = ['project files'];
  return rawData
    .filter(({ attributes }: { attributes: any }) =>
      userFiles.includes(attributes.name.toLowerCase()),
    )
    .map(({ id, attributes }: { id: string; attributes: any }) => ({
      id,
      name: attributes.displayName,
      ct: attributes.createTime,
      mt: attributes.lastModifiedTime,
      objectCount: attributes.objectCount,
    }));
};

export const formatFolderContents = (rawData: any) => {
  const allowedTypes = ['folder', 'items'];
  return rawData
    .filter(({ type }: { type: string }) => allowedTypes.includes(type))
    .map(({ type, id, attributes }: { type: string; id: string; attributes: any }) => ({
      type,
      id,
      name: attributes.displayName,
      ct: attributes.createTime,
      mt: attributes.lastModifiedTime,
      createdBy: attributes.createUserName,
      modifiedBy: attributes.lastModifiedUserName,
      hidden: attributes.hidden,
    }));
};
