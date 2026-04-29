import type { PropertyChange } from "../components/CompareVersionsModal";

export function parseNumericValue(val: unknown): number | null {
  if (typeof val !== "string") return null;
  const match = val.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

export function getChangeDescription(change: PropertyChange): string {
  if (change.field === "position" && change.distance !== undefined) {
    return `Moved ${change.distance.toFixed(2)}m`;
  }
  if (change.field === "length") {
    const from = parseNumericValue(change.from);
    const to = parseNumericValue(change.to);
    if (from !== null && to !== null) {
      const diff = to - from;
      const dir = diff > 0 ? "increased" : "decreased";
      const unit =
        typeof change.from === "string" && change.from.includes("mm")
          ? "mm"
          : "m";
      return `Length ${dir} by ${Math.abs(diff).toFixed(0)}${unit}`;
    }
  }
  const label = change.field.charAt(0).toUpperCase() + change.field.slice(1);
  return `${label} changed from ${change.from ?? "none"} to ${change.to ?? "none"}`;
}
