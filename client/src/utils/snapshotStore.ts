import { getAccessToken } from "@/api/auth";
import { fetchVersionElements, saveVersionElements } from "@/api/project";
import type { ModelElement } from "@/api/project";

export type Snapshot = {
  urn: string;
  elements: ModelElement[];
};

const cache = new Map<string, Snapshot>();

const PROP_FILTER = ["Category", "name", "Level", "Material", "Length"];
const EXTRACTION_TIMEOUT_MS = 120_000;

function extractElements(viewer: any): Promise<ModelElement[]> {
  return new Promise((resolve, reject) => {
    const tree = viewer.model.getInstanceTree();
    if (!tree) {
      reject(new Error("Instance tree not available"));
      return;
    }

    const leafDbIds: number[] = [];
    tree.enumNodeChildren(
      tree.getRootId(),
      (dbId: number) => {
        if (tree.getChildCount(dbId) === 0) leafDbIds.push(dbId);
      },
      true,
    );

    if (leafDbIds.length === 0) {
      resolve([]);
      return;
    }

    viewer.model.getExternalIdMapping(
      (extIdMap: Record<string, number>) => {
        const dbIdToExtId: Record<number, string> = {};
        for (const [extId, dbId] of Object.entries(extIdMap)) {
          dbIdToExtId[dbId] = extId;
        }

        viewer.model.getBulkProperties(
          leafDbIds,
          { propFilter: PROP_FILTER },
          (results: any[]) => {
            const elements: ModelElement[] = results
              .filter((r) => dbIdToExtId[r.dbId])
              .map((r) => {
                const props: ModelElement["properties"] = {};
                for (const p of r.properties) {
                  const key = (p.displayName as string).toLowerCase();
                  if (key === "category") props.category = String(p.displayValue);
                  else if (key === "name") props.name = String(p.displayValue);
                  else if (key === "level") props.level = String(p.displayValue);
                  else if (key === "material") props.material = String(p.displayValue);
                  else if (key === "length") props.length = String(p.displayValue);
                }
                return { externalId: dbIdToExtId[r.dbId], properties: props };
              });
            resolve(elements);
          },
          (err: any) => reject(new Error(`getBulkProperties failed: ${err}`)),
        );
      },
      (err: any) => reject(new Error(`getExternalIdMapping failed: ${err}`)),
    );
  });
}

async function extractFromViewer(urn: string): Promise<ModelElement[]> {
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;";
  document.body.appendChild(container);

  try {
    const accessToken = await getAccessToken();

    return await new Promise<ModelElement[]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Model extraction timed out for URN: ${urn}`));
      }, EXTRACTION_TIMEOUT_MS);

      window.Autodesk.Viewing.Initializer({ accessToken }, () => {
        const viewer = new window.Autodesk.Viewing.GuiViewer3D(container, {});
        viewer.start();

        const onTreeCreated = () => {
          clearTimeout(timeout);
          extractElements(viewer)
            .then((elements) => {
              viewer.finish();
              resolve(elements);
            })
            .catch((err) => {
              viewer.finish();
              reject(err);
            });
        };

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
            clearTimeout(timeout);
            viewer.removeEventListener(
              window.Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
              onTreeCreated,
            );
            viewer.finish();
            reject(new Error(`Failed to load model ${urn}: ${errCode} ${errMsg}`));
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
  if (cache.has(urn)) return cache.get(urn)!;

  const serverElements = await fetchVersionElements(itemId, versionNumber);
  if (serverElements.length > 0) {
    const snapshot: Snapshot = { urn, elements: serverElements };
    cache.set(urn, snapshot);
    return snapshot;
  }

  const elements = await extractFromViewer(urn);
  await saveVersionElements(itemId, versionNumber, elements);

  const snapshot: Snapshot = { urn, elements };
  cache.set(urn, snapshot);
  return snapshot;
}
