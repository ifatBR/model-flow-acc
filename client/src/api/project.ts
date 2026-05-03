import { API_BASE } from "@/constants/routes";

export interface Hub {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface TopFolder {
  id: string;
  name: string;
  ct: string;
  mt: string;
  objectCount: number;
}

export interface FolderItem {
  type: "folders" | "items";
  id: string;
  name: string;
  ct: string;
  mt: string;
  createdBy?: string;
  modifiedBy?: string;
  hidden?: boolean;
}

export interface ItemVersion {
  type: "versions";
  id: string;
  versionNumber: number;
  displayName?: string;
}

export interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

export interface ModelElement {
  externalId: string;
  properties: {
    category?: string;
    name?: string;
    level?: string;
    material?: string;
    length?: string;
    area?: string;
    height?: string;
    thickness?: string;
    [key: string]: unknown;
  };
  boundingBox?: BoundingBox;
}

const SAVE_CHUNK_SIZE = 500;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok)
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export const fetchHubs = () => get<Hub[]>("/hubs");

export const fetchProjects = (hubId: string) =>
  get<Project[]>(`/hubs/${hubId}/projects`);

export const fetchTopFolders = (hubId: string, projectId: string) =>
  get<TopFolder[]>(`/hubs/${hubId}/projects/${projectId}/topFolders`);

export const fetchFolderContents = (projectId: string, folderId: string) =>
  get<FolderItem[]>(`/projects/${projectId}/folders/${folderId}/contents`);

export const getItemVersions = (projectId: string, itemId: string) =>
  get<ItemVersion[]>(`/projects/${projectId}/items/${itemId}/versions`);

export const fetchVersionElements = (itemId: string, versionNumber: number) =>
  get<ModelElement[]>(
    `/models/${encodeURIComponent(itemId)}/versions/${versionNumber}/elements`,
  );

export async function saveVersionElements(
  itemId: string,
  versionNumber: number,
  elements: ModelElement[],
): Promise<void> {
  for (let i = 0; i < elements.length; i += SAVE_CHUNK_SIZE) {
    const chunk = elements.slice(i, i + SAVE_CHUNK_SIZE);

    const res = await fetch(
      `${API_BASE}/models/${encodeURIComponent(itemId)}/versions/${versionNumber}/elements/chunks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunkIndex: i / SAVE_CHUNK_SIZE,
          isLastChunk: i + SAVE_CHUNK_SIZE >= elements.length,
          elements: chunk,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(
        `Failed to save elements chunk: ${res.status} ${res.statusText}`,
      );
    }
  }
}
