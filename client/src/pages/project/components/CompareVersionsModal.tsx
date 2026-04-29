import { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Tabs,
  NativeSelect,
  Spinner,
} from "@chakra-ui/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Buffer } from "buffer";
import type { ItemVersion, ModelElement } from "@/api/project";
import { ensureSnapshot } from "@/utils/snapshotStore";
import { Tooltip } from "@/components/ui/tooltip";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PropertyChange {
  field: string;
  from: unknown;
  to: unknown;
  distance?: number;
}

interface ModifiedElement {
  externalId: string;
  element: ModelElement;
  changes: PropertyChange[];
}

interface ComparisonResult {
  added: ModelElement[];
  removed: ModelElement[];
  modified: ModifiedElement[];
}

type TabType = "added" | "modified" | "removed";

interface ConfirmState {
  message: string;
  onConfirm: () => void;
}

export interface CompareVersionsModalProps {
  versions: ItemVersion[];
  itemId: string;
  currentVersionNumber: number;
  viewerRef: React.MutableRefObject<any>;
  onVersionChange: (urn: string, versionNumber: number) => void;
  onClose: () => void;
}

// ─── Comparison logic ────────────────────────────────────────────────────────

const COMPARED_FIELDS = [
  "level",
  "material",
  "length",
  "area",
  "height",
  "thickness",
];
const POSITION_THRESHOLD = 0.01;

function compareProperties(
  v1Props: Record<string, unknown>,
  v2Props: Record<string, unknown>,
): PropertyChange[] {
  return COMPARED_FIELDS.filter(
    (field) =>
      v1Props[field] !== v2Props[field] &&
      (v1Props[field] !== undefined || v2Props[field] !== undefined),
  ).map((field) => ({ field, from: v1Props[field], to: v2Props[field] }));
}

function getBBoxCenter(bbox: NonNullable<ModelElement["boundingBox"]>) {
  return {
    x: (bbox.min.x + bbox.max.x) / 2,
    y: (bbox.min.y + bbox.max.y) / 2,
    z: (bbox.min.z + bbox.max.z) / 2,
  };
}

function getDistance(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
}

function runComparison(
  earlierElements: ModelElement[],
  laterElements: ModelElement[],
): ComparisonResult {
  const v1Map = new Map(earlierElements.map((e) => [e.externalId, e]));
  const v2Map = new Map(laterElements.map((e) => [e.externalId, e]));

  const added: ModelElement[] = [];
  const removed: ModelElement[] = [];
  const modified: ModifiedElement[] = [];

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
        modified.push({ externalId: id, element: elem, changes });
      }
    }
  }

  for (const [id, elem] of v1Map) {
    if (!v2Map.has(id)) removed.push(elem);
  }

  return { added, removed, modified };
}

// ─── Display helpers ─────────────────────────────────────────────────────────

function getElementDisplayName(elem: ModelElement): string {
  const { category, name, level } = elem.properties;
  const cat = category ?? "Unknown";
  const lvl = level ? ` (${level})` : "";
  if (name) return `${cat} ${name}${lvl}`;
  return `${cat}${lvl}`;
}

function parseNumericValue(val: unknown): number | null {
  if (typeof val !== "string") return null;
  const match = val.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function getChangeDescription(change: PropertyChange): string {
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

// ─── Viewer helpers ───────────────────────────────────────────────────────────

function getExternalIdMap(viewer: any): Promise<Record<string, number>> {
  return new Promise((resolve) => {
    viewer.model.getExternalIdMapping((mapping: Record<string, number>) =>
      resolve(mapping),
    );
  });
}

async function isolateAndHighlight(
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

// ─── Component ───────────────────────────────────────────────────────────────

export function CompareVersionsModal({
  versions,
  itemId,
  currentVersionNumber,
  viewerRef,
  onVersionChange,
  onClose,
}: CompareVersionsModalProps) {
  const latestVersionNumber = versions[0]?.versionNumber ?? 0;

  const [selectedV1, setSelectedV1] = useState<number | null>(null);
  const [selectedV2, setSelectedV2] = useState<number | null>(null);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("added");
  const [laterVersionNum, setLaterVersionNum] = useState<number | null>(null);
  const [earlierVersionNum, setEarlierVersionNum] = useState<number | null>(
    null,
  );
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [hoveredRemovedId, setHoveredRemovedId] = useState<string | null>(null);

  const idMapRef = useRef<Record<string, number> | null>(null);

  // Clear cached mapping whenever the loaded version changes
  useEffect(() => {
    idMapRef.current = null;
  }, [currentVersionNumber]);

  const switchToVersion = useCallback(
    (versionNumber: number) => {
      const target = versions.find((v) => v.versionNumber === versionNumber);
      if (!target) return;
      const encodedUrn = Buffer.from(target.id).toString("base64");
      onVersionChange(encodedUrn, versionNumber);
    },
    [versions, onVersionChange],
  );

  const handleCompare = async () => {
    if (selectedV1 === null || selectedV2 === null) return;
    const later = Math.max(selectedV1, selectedV2);
    const earlier = Math.min(selectedV1, selectedV2);

    const laterVersion = versions.find((v) => v.versionNumber === later);
    const earlierVersion = versions.find((v) => v.versionNumber === earlier);
    if (!laterVersion || !earlierVersion) return;

    const laterUrn = Buffer.from(laterVersion.id).toString("base64");
    const earlierUrn = Buffer.from(earlierVersion.id).toString("base64");

    setComparing(true);
    idMapRef.current = null;
    try {
      const earlierSnap = await ensureSnapshot(earlierUrn, itemId, earlier);
      const laterSnap = await ensureSnapshot(laterUrn, itemId, later);

      setResult(runComparison(earlierSnap.elements, laterSnap.elements));
      setLaterVersionNum(later);
      setEarlierVersionNum(earlier);
      setActiveTab("added");

      if (currentVersionNumber !== later) {
        switchToVersion(later);
      }
    } finally {
      setComparing(false);
    }
  };

  const handleBack = () => {
    setResult(null);
    setLaterVersionNum(null);
    setEarlierVersionNum(null);
    setConfirm(null);
    setHoveredRemovedId(null);
  };

  const doIsolate = useCallback(
    (elem: ModelElement, color: { r: number; g: number; b: number }) => {
      const viewer = viewerRef.current;
      if (viewer) {
        isolateAndHighlight(viewer, elem.externalId, color, idMapRef);
      }
    },
    [viewerRef],
  );

  const handleAddedClick = useCallback(
    (elem: ModelElement) => {
      if (
        laterVersionNum !== null &&
        currentVersionNumber !== laterVersionNum
      ) {
        setConfirm({
          message: `Added elements are in Version ${laterVersionNum}. Switch to it?`,
          onConfirm: () => {
            switchToVersion(laterVersionNum);
            setConfirm(null);
            setTimeout(() => doIsolate(elem, { r: 0, g: 1, b: 0 }), 3000);
          },
        });
      } else {
        doIsolate(elem, { r: 0, g: 1, b: 0 });
      }
    },
    [currentVersionNumber, laterVersionNum, switchToVersion, doIsolate],
  );

  const handleModifiedClick = useCallback(
    (elem: ModelElement) => {
      if (
        laterVersionNum !== null &&
        currentVersionNumber !== laterVersionNum
      ) {
        setConfirm({
          message: `Switch to Version ${laterVersionNum} to see the modified state?`,
          onConfirm: () => {
            switchToVersion(laterVersionNum);
            setConfirm(null);
            setTimeout(() => doIsolate(elem, { r: 1, g: 1, b: 0 }), 3000);
          },
        });
      } else {
        doIsolate(elem, { r: 1, g: 1, b: 0 });
      }
    },
    [currentVersionNumber, laterVersionNum, switchToVersion, doIsolate],
  );

  const handleRemovedSwitch = useCallback(
    (elem: ModelElement) => {
      if (earlierVersionNum === null) return;
      switchToVersion(earlierVersionNum);
      setHoveredRemovedId(null);
      setTimeout(() => doIsolate(elem, { r: 1, g: 0, b: 0 }), 3000);
    },
    [earlierVersionNum, switchToVersion, doIsolate],
  );

  const isCurrentLatest = currentVersionNumber === latestVersionNumber;

  const otherVersionNum =
    laterVersionNum !== null && earlierVersionNum !== null
      ? currentVersionNumber === laterVersionNum
        ? earlierVersionNum
        : laterVersionNum
      : null;

  return (
    <Box
      position="absolute"
      top="60px"
      left="16px"
      zIndex={100}
      w="340px"
      maxH="calc(100% - 80px)"
      bg="white"
      _dark={{ bg: "gray.800" }}
      borderRadius="md"
      boxShadow="xl"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* ── Header ── */}
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={3}
        borderBottomWidth="1px"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          {result && (
            <Tooltip content="Select versions">
              <Button size="xs" variant="ghost" onClick={handleBack} p={1}>
                <ArrowLeft size={14} />
              </Button>
            </Tooltip>
          )}
          <Text fontWeight="semibold" fontSize="sm">
            {result ? "Difference" : "Compare Versions"}
          </Text>
        </Flex>
        <Button
          size="xs"
          variant="ghost"
          onClick={onClose}
          p={1}
          aria-label="Close"
        >
          ✕
        </Button>
      </Flex>

      {/* ── Version banner (diff view only) ── */}
      {result && laterVersionNum !== null && (
        <Box
          px={4}
          py={2}
          bg="blue.50"
          _dark={{ bg: "blue.900" }}
          borderBottomWidth="1px"
          flexShrink={0}
        >
          <Flex align="center" justify="space-between">
            <Text fontSize="xs" fontWeight="medium">
              Viewer: Version {currentVersionNumber}
            </Text>
            {otherVersionNum !== null && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => switchToVersion(otherVersionNum)}
              >
                Switch to v{otherVersionNum}
              </Button>
            )}
          </Flex>
          {!isCurrentLatest && (
            <Text fontSize="xs" color="orange.500" mt={1}>
              This is not the latest version
            </Text>
          )}
        </Box>
      )}

      {/* ── Inline confirmation ── */}
      {confirm && (
        <Box
          px={4}
          py={2}
          bg="yellow.50"
          _dark={{ bg: "yellow.900" }}
          borderBottomWidth="1px"
          flexShrink={0}
        >
          <Text fontSize="xs" mb={2}>
            {confirm.message}
          </Text>
          <Flex gap={2}>
            <Button size="xs" onClick={confirm.onConfirm}>
              Yes
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setConfirm(null)}
            >
              No
            </Button>
          </Flex>
        </Box>
      )}

      {/* ── Body ── */}
      <Box overflowY="auto" flex={1}>
        {!result ? (
          // Version selection
          <Box p={4}>
            <Text fontSize="xs" color="gray.500" mb={3}>
              Select two versions to compare
            </Text>
            <Flex gap={2} mb={4}>
              <NativeSelect.Root flex={1} size="sm">
                <NativeSelect.Field
                  value={selectedV1 ?? ""}
                  onChange={(e) =>
                    setSelectedV1(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  fontSize="xs"
                >
                  <option value="">Version…</option>
                  {versions.map((v) => (
                    <option
                      key={v.versionNumber}
                      value={v.versionNumber}
                      disabled={v.versionNumber === selectedV2}
                    >
                      Version {v.versionNumber}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>

              <NativeSelect.Root flex={1} size="sm">
                <NativeSelect.Field
                  value={selectedV2 ?? ""}
                  onChange={(e) =>
                    setSelectedV2(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  fontSize="xs"
                >
                  <option value="">Version…</option>
                  {versions.map((v) => (
                    <option
                      key={v.versionNumber}
                      value={v.versionNumber}
                      disabled={v.versionNumber === selectedV1}
                    >
                      Version {v.versionNumber}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Flex>

            <Button
              w="full"
              size="sm"
              disabled={selectedV1 === null || selectedV2 === null || comparing}
              onClick={handleCompare}
            >
              {comparing ? <Spinner size="xs" /> : "Compare"}
            </Button>
          </Box>
        ) : (
          // Diff view
          <Box>
            {/* Subtitle */}
            <Box px={4} py={2} borderBottomWidth="1px">
              <Flex align="center" gap={1} fontSize="xs">
                <Text color="gray.500">Comparing versions:</Text>
                <Text fontWeight="medium">v{earlierVersionNum}</Text>
                <ArrowRight size={12} />
                <Text fontWeight="medium">v{laterVersionNum}</Text>
              </Flex>
            </Box>

            {/* Tabs */}
            <Tabs.Root
              value={activeTab}
              onValueChange={(e) => setActiveTab(e.value as TabType)}
              size="sm"
            >
              <Tabs.List>
                <Tabs.Trigger value="added" fontSize="xs">
                  Added ({result.added.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="modified" fontSize="xs">
                  Modified ({result.modified.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="removed" fontSize="xs">
                  Removed ({result.removed.length})
                </Tabs.Trigger>
              </Tabs.List>

              {/* Added */}
              <Tabs.Content value="added" p={0}>
                {result.added.length === 0 ? (
                  <Text px={4} py={3} fontSize="xs" color="gray.400">
                    No elements added
                  </Text>
                ) : (
                  result.added.map((elem) => (
                    <Box
                      key={elem.externalId}
                      px={4}
                      py={2}
                      cursor="pointer"
                      _hover={{ bg: "green.50" }}
                      borderBottomWidth="1px"
                      onClick={() => handleAddedClick(elem)}
                    >
                      <Text fontSize="xs" fontWeight="medium" color="green.700">
                        + {getElementDisplayName(elem)}
                      </Text>
                    </Box>
                  ))
                )}
              </Tabs.Content>

              {/* Modified */}
              <Tabs.Content value="modified" p={0}>
                {result.modified.length === 0 ? (
                  <Text px={4} py={3} fontSize="xs" color="gray.400">
                    No elements modified
                  </Text>
                ) : (
                  result.modified.map(({ externalId, element, changes }) => (
                    <Box
                      key={externalId}
                      px={4}
                      py={2}
                      cursor="pointer"
                      _hover={{ bg: "yellow.50" }}
                      borderBottomWidth="1px"
                      onClick={() => handleModifiedClick(element)}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="medium"
                        color="yellow.700"
                      >
                        ~ {getElementDisplayName(element)}
                      </Text>
                      {changes.map((change, i) => (
                        <Text
                          key={i}
                          fontSize="xs"
                          color="gray.500"
                          pl={2}
                          mt={0.5}
                        >
                          • {getChangeDescription(change)}
                        </Text>
                      ))}
                    </Box>
                  ))
                )}
              </Tabs.Content>

              {/* Removed */}
              <Tabs.Content value="removed" p={0}>
                {result.removed.length === 0 ? (
                  <Text px={4} py={3} fontSize="xs" color="gray.400">
                    No elements removed
                  </Text>
                ) : (
                  result.removed.map((elem) => (
                    <Box
                      key={elem.externalId}
                      onMouseEnter={() => setHoveredRemovedId(elem.externalId)}
                      onMouseLeave={() => setHoveredRemovedId(null)}
                    >
                      <Box
                        px={4}
                        py={2}
                        borderBottomWidth="1px"
                        _hover={{ bg: "red.50" }}
                      >
                        <Text fontSize="xs" fontWeight="medium" color="red.700">
                          - {getElementDisplayName(elem)}
                        </Text>
                        {hoveredRemovedId === elem.externalId && (
                          <Box mt={1}>
                            <Text fontSize="xs" color="gray.600" mb={1}>
                              Switch to v{earlierVersionNum} to see this
                              element?
                            </Text>
                            <Flex gap={2}>
                              <Button
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovedSwitch(elem);
                                }}
                              >
                                Yes
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHoveredRemovedId(null);
                                }}
                              >
                                No
                              </Button>
                            </Flex>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))
                )}
              </Tabs.Content>
            </Tabs.Root>
          </Box>
        )}
      </Box>
    </Box>
  );
}
