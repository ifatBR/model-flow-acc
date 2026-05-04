export const FIELD_UNIT: Record<string, keyof typeof UNIT_LABELS> = {
  length: "linear",
  width: "linear",
  height: "linear",
  diameter: "linearSmall",
  thickness: "linear",
  area: "area",
  volume: "volume",
  insulation: "linearSmall",
};

export const KEY_DIMENSION_BY_CATEGORY: Record<string, string[]> = {
  walls: ["length", "area", "height", "thickness"],
  curtainPanels: ["length", "area", "height", "thickness"],
  doors: ["width", "height"],
  windows: ["width", "height"],
  columns: ["width", "length", "height", "diameter"],
  pipes: ["length", "diameter"],
  ducts: ["length", "width", "height"],
  floors: ["area", "thickness"],
  airTerminals: ["width", "height", "diameter"],
  lightingFixtures: ["width", "length", "height", "diameter"],
};

const DIVIDERS: Record<string, number> = {
  length: 10,
  area: 10,
  height: 10,
  thickness: 10,
  width: 10,
};

const CATEGORY_KEY_MAP: Record<string, string> = {
  wall: "walls",
  walls: "walls",
  "revit walls": "walls",
  door: "doors",
  doors: "doors",
  "revit doors": "doors",
  window: "windows",
  windows: "windows",
  "revit windows": "windows",
  column: "columns",
  columns: "columns",
  "structural columns": "columns",
  pipe: "pipes",
  pipes: "pipes",
  "pipe fittings": "pipes",
  "pipe accessories": "pipes",
  "plumbing fixtures": "pipes",
  "revit pipes": "pipes",
  duct: "ducts",
  ducts: "ducts",
  "duct fittings": "ducts",
  "duct accessories": "ducts",
  "flex ducts": "ducts",
  "revit ducts": "ducts",
  floor: "floors",
  floors: "floors",
  "revit floors": "floors",
  "revit air terminals": "airTerminals",
  "revit curtain panels": "curtainPanels",
  "revit lighting fixtures": "lightingFixtures",
};

export const UNIT_LABELS = {
  linearSmall: "mm",
  linear: "cm",
  area: "m²",
  volume: "m³",
};

export function getCategoryKey(category?: string): string | undefined {
  if (!category) return undefined;
  return CATEGORY_KEY_MAP[category.toLowerCase().trim()];
}

export const getFormattedValue = (
  field: string | undefined,
  value: string | undefined,
) => {
  if (!field || !value) return;
  const formattedValue = Number(value) / (DIVIDERS[field] || 1);
  return formattedValue.toFixed(2);
};
