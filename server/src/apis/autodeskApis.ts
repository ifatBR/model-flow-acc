export const AUTODESK_BASIC_URL = 'https://developer.api.autodesk.com/';
export const AUTODEKS_APIS = {
  getToken: 'authentication/v2/token',
  OSS: {
    createBucket: 'oss/v2/buckets',
    getSignedS3Upload: (bucketKey: string, objectKey: string) =>
      `/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`,
    listObjects: (bucketKey: string) => `oss/v2/buckets/${bucketKey}/objects`,
  },
  DERIVIATIVE: {
    translateObject: 'modelderivative/v2/designdata/job',
    getManifest: (urn: string) => `modelderivative/v2/designdata/${urn}/manifest`,
  },
  HUBS: {
    getHubs: 'project/v1/hubs',
    getHubById: (id: string) => `project/v1/hubs/${id}/projects`,
    getProjectFolders: (hubId: string, projectId: string) =>
      `project/v1/hubs/${hubId}/projects/${projectId}/topFolders`,
  },
  PROJECTS: {
    getFolderContent: (projectId: string, folderId: string) =>
      `data/v1/projects/${projectId}/folders/${folderId}/contents`,
    getItemVersions: (projectId: string, itemId: string) =>
      `data/v1/projects/${projectId}/items/${itemId}/versions`,
  },
};
