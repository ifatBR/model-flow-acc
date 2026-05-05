import type { SelectedElementData } from "@/context/ViewerModal.context.";

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

function findProp(props: any[], ...names: string[]): string | undefined {
  for (const name of names) {
    const match = props.find(
      (p: any) => p.displayName?.toLowerCase() === name.toLowerCase(),
    );
    if (
      match &&
      match.displayValue !== null &&
      match.displayValue !== undefined &&
      match.displayValue !== ""
    ) {
      return String(match.displayValue);
    }
  }
  return undefined;
}

export function parseViewerElement(result: any): SelectedElementData {
  const props: any[] = result.properties ?? [];
  return {
    properties: {
      category: findProp(props, "Category"),
      name: findProp(props, "Type Name", "Family and Type", "Family Name"),
      level: findProp(
        props,
        "Level",
        "Base Level",
        "Base Constraint",
        "Reference Level",
        "Schedule Level",
      ),
      material: findProp(
        props,
        "Structural Material",
        "Material",
        "Top Material",
      ),
      length: findProp(props, "Length"),
      area: findProp(props, "Area"),
      height: findProp(props, "Height", "Unconnected Height", "Rough Height"),
      thickness: findProp(props, "Thickness"),
      width: findProp(props, "Width", "Rough Width"),
      diameter: findProp(props, "Outer Diameter", "Diameter"),
      slope: findProp(props, "Slope"),
      insulation: findProp(
        props,
        "Insulation Thickness",
        "Insulation Type",
        "Insulation Lining Thickness",
      ),
    },
  };
}
