export function getExternalIdMap(viewer: any): Promise<Record<string, number>> {
  return new Promise((resolve) => {
    viewer.model.getExternalIdMapping((mapping: Record<string, number>) =>
      resolve(mapping),
    );
  });
}

export async function isolateAndHighlight(
  viewer: any,
  externalId: string,
  color: { r: number; g: number; b: number },
  idMapRef: React.MutableRefObject<Record<string, number> | null>,
) {
  if (!viewer?.model) return;
  if (!idMapRef.current) {
    idMapRef.current = await getExternalIdMap(viewer);
  }
  const dbId = idMapRef.current[externalId];
  if (dbId === undefined) return;

  viewer.clearThemingColors(viewer.model);
  viewer.isolate([dbId], viewer.model);
  viewer.setThemingColor(
    dbId,
    new window.THREE.Vector4(color.r, color.g, color.b, 1),
    viewer.model,
    true,
  );
  viewer.fitToView([dbId]);
}

export async function clearIsolateAndHighlight(viewer: any) {
  if (!viewer?.model) return;
  viewer.isolate([], viewer.model);
  viewer.clearThemingColors();
  viewer.select([]);
  viewer.fitToView();
}
