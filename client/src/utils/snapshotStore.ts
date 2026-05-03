import { getAccessToken } from "@/api/auth";
import { fetchVersionElements, saveVersionElements } from "@/api/project";
import type { ModelElement } from "@/api/project";

export type Snapshot = {
  urn: string;
  elements: ModelElement[];
};

const cache = new Map<string, Snapshot>();

const PROP_FILTER = [
  "Category",
  "name",
  "Level",
  "Material",
  "Length",
  "Width",
  "Height",
  "Thickness",
  "Slope",
];

const CHUNK_SIZE = 100;
const EXTRACTION_TIMEOUT_MS = 120_000;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }

  return chunks;
}

function getLeafDbIds(viewer: any): number[] {
  const tree = viewer.model.getInstanceTree();
  if (!tree) throw new Error("Instance tree not available");

  const leafDbIds: number[] = [];

  tree.enumNodeChildren(
    tree.getRootId(),
    (dbId: number) => {
      if (tree.getChildCount(dbId) === 0) {
        leafDbIds.push(dbId);
      }
    },
    true,
  );

  return leafDbIds;
}

function getExternalIdMapping(viewer: any): Promise<Record<string, number>> {
  return new Promise((resolve, reject) => {
    viewer.model.getExternalIdMapping(resolve, reject);
  });
}

function getBulkProperties(viewer: any, dbIds: number[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    viewer.model.getBulkProperties(
      dbIds,
      { propFilter: PROP_FILTER },
      resolve,
      reject,
    );
  });
}

async function getBulkPropertiesInChunks(
  viewer: any,
  dbIds: number[],
): Promise<any[]> {
  const chunks = chunkArray(dbIds, CHUNK_SIZE);
  const allResults: any[] = [];

  for (const chunk of chunks) {
    const results = await getBulkProperties(viewer, chunk);
    allResults.push(...results);
  }

  return allResults;
}

function mapResultsToElements(
  results: any[],
  extIdMap: Record<string, number>,
): ModelElement[] {
  const dbIdToExtId: Record<number, string> = {};

  for (const [externalId, dbId] of Object.entries(extIdMap)) {
    dbIdToExtId[dbId] = externalId;
  }

  const propKeys = PROP_FILTER.map((name) => name.toLowerCase());

  return results
    .filter((r) => dbIdToExtId[r.dbId])
    .map((r) => {
      const props: ModelElement["properties"] = {
        name: r.name,
      };

      for (const p of r.properties) {
        const key = String(p.displayName).toLowerCase();

        if (propKeys.includes(key)) {
          props[key] = String(p.displayValue);
        }
      }

      return {
        externalId: dbIdToExtId[r.dbId],
        properties: props,
      };
    });
}

async function extractElements(viewer: any): Promise<ModelElement[]> {
  const leafDbIds = getLeafDbIds(viewer);

  if (leafDbIds.length === 0) {
    return [];
  }

  const extIdMap = await getExternalIdMapping(viewer);
  const results = await getBulkPropertiesInChunks(viewer, leafDbIds);

  return mapResultsToElements(results, extIdMap);
}

async function extractFromViewer(urn: string): Promise<ModelElement[]> {
  const container = document.createElement("div");

  container.style.cssText =
    "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;";

  document.body.appendChild(container);

  let viewer: any | null = null;

  try {
    const accessToken = await getAccessToken();

    return await new Promise<ModelElement[]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Model extraction timed out for URN: ${urn}`));
      }, EXTRACTION_TIMEOUT_MS);

      function cleanup() {
        clearTimeout(timeout);

        if (viewer) {
          viewer.removeEventListener(
            window.Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
            onTreeCreated,
          );
          viewer.finish();
          viewer = null;
        }
      }

      const onTreeCreated = async () => {
        try {
          const elements = await extractElements(viewer);
          cleanup();
          resolve(elements);
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      window.Autodesk.Viewing.Initializer({ accessToken }, () => {
        viewer = new window.Autodesk.Viewing.GuiViewer3D(container, {});
        viewer.start();

        viewer.addEventListener(
          window.Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
          onTreeCreated,
        );

        window.Autodesk.Viewing.Document.load(
          `urn:${urn}`,
          (doc: any) => {
            const defaultGeom = doc.getRoot().getDefaultGeometry();
            viewer.loadDocumentNode(doc, defaultGeom);
          },
          (errCode: number, errMsg: string) => {
            cleanup();
            reject(
              new Error(`Failed to load model ${urn}: ${errCode} ${errMsg}`),
            );
          },
        );
      });
    });
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export async function ensureSnapshot(
  urn: string,
  itemId: string,
  versionNumber: number,
): Promise<Snapshot> {
  const cached = cache.get(urn);
  if (cached) return cached;

  const serverElements = await fetchVersionElements(itemId, versionNumber);

  if (serverElements.length > 0) {
    const snapshot = { urn, elements: serverElements };
    cache.set(urn, snapshot);
    return snapshot;
  }

  const elements = await extractFromViewer(urn);

  await saveVersionElements(itemId, versionNumber, elements);

  const snapshot = { urn, elements };
  cache.set(urn, snapshot);

  return snapshot;
}
