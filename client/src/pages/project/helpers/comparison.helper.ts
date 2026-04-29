import type { ModelElement } from "@/api/project";
import type {
  ComparisonResult,
  ListElement,
  PropertyChange,
} from "../components/CompareVersionsModal";

const COMPARED_FIELDS = [
  "level",
  "material",
  "length",
  "area",
  "height",
  "thickness",
];
const POSITION_THRESHOLD = 0.01;

export function compareProperties(
  v1Props: Record<string, unknown>,
  v2Props: Record<string, unknown>,
): PropertyChange[] {
  return COMPARED_FIELDS.filter(
    (field) =>
      v1Props[field] !== v2Props[field] &&
      (v1Props[field] !== undefined || v2Props[field] !== undefined),
  ).map((field) => ({ field, from: v1Props[field], to: v2Props[field] }));
}

export function getBBoxCenter(bbox: NonNullable<ModelElement["boundingBox"]>) {
  return {
    x: (bbox.min.x + bbox.max.x) / 2,
    y: (bbox.min.y + bbox.max.y) / 2,
    z: (bbox.min.z + bbox.max.z) / 2,
  };
}

export function getDistance(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
}

export function runComparison(
  earlierElements: ListElement[],
  laterElements: ListElement[],
): ComparisonResult {
  const v1Map = new Map(earlierElements.map((e) => [e.externalId, e]));
  const v2Map = new Map(laterElements.map((e) => [e.externalId, e]));

  const added: ListElement[] = [];
  const removed: ListElement[] = [];
  const modified: ListElement[] = [];

  for (const [id, elem] of v2Map) {
    if (!v1Map.has(id)) {
      added.push(elem);
    } else {
      const v1Elem = v1Map.get(id)!;
      const changes: PropertyChange[] = compareProperties(
        v1Elem.properties as Record<string, unknown>,
        elem.properties as Record<string, unknown>,
      );

      if (v1Elem.boundingBox && elem.boundingBox) {
        const c1 = getBBoxCenter(v1Elem.boundingBox);
        const c2 = getBBoxCenter(elem.boundingBox);
        const dist = getDistance(c1, c2);
        if (dist > POSITION_THRESHOLD) {
          changes.push({ field: "position", from: c1, to: c2, distance: dist });
        }
      }

      if (changes.length > 0) {
        modified.push({ ...elem, changes });
      }
    }
  }

  for (const [id, elem] of v1Map) {
    if (!v2Map.has(id)) removed.push(elem);
  }

  return { added, removed, modified };
}
