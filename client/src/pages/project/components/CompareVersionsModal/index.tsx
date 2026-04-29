import { useState, useCallback, useRef, useEffect } from "react";
import { Box, Flex, Text, NativeSelect, Spinner } from "@chakra-ui/react";
import { ArrowLeft, SpaceIcon, TriangleAlert } from "lucide-react";
import { Buffer } from "buffer";
import type { ItemVersion, ModelElement } from "@/api/project";
import { ensureSnapshot } from "@/utils/snapshotStore";
import { Tooltip } from "@/components/ui/tooltip";
import { runComparison } from "../../helpers/comparison.helper";
import { isolateAndHighlight } from "../../helpers/viewer.helper";
import { Button } from "@/components/Button";
import {
  BORDER_WIDTHS,
  COLORS,
  ICON_SIZES,
  RADII,
  SHADOWS,
  SPACING,
  Z_INDEX,
} from "@/styles/designTokens";
import { BodyText, Caption, SectionTitle } from "@/components/Typography";
import { DiffView } from "./DiffView";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PropertyChange {
  field: string;
  from: unknown;
  to: unknown;
  distance?: number;
}

export interface ListElement extends ModelElement {
  changes?: PropertyChange[];
}

export interface ComparisonResult {
  added: ListElement[];
  removed: ListElement[];
  modified: ListElement[];
}

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

  const [earlierVersionNum, setEarlierVersionNum] = useState<number | null>(
    null,
  );
  const [laterVersionNum, setLaterVersionNum] = useState<number | null>(null);
  const [selectedV1, setSelectedV1] = useState<number | null>(null);
  const [selectedV2, setSelectedV2] = useState<number | null>(null);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

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

      if (currentVersionNumber !== later) {
        switchToVersion(later);
      }
    } finally {
      setComparing(false);
    }
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

  const handleBack = () => {
    setResult(null);
    // setLaterVersionNum(null);
    // setEarlierVersionNum(null);
    // setConfirm(null);
  };

  const handleItemClick = useCallback(
    (
      elem: ModelElement,
      toLaterVersion: boolean,
      color: { r: number; g: number; b: number },
    ) => {
      const requiredVersion = toLaterVersion
        ? laterVersionNum
        : earlierVersionNum;

      if (
        requiredVersion !== null &&
        currentVersionNumber !== requiredVersion
      ) {
        setConfirm({
          message: `Element is in Version ${requiredVersion}. Switch to it?`,
          onConfirm: () => {
            switchToVersion(requiredVersion);
            setConfirm(null);
            setTimeout(() => doIsolate(elem, color), 3000);
          },
        });
      } else {
        doIsolate(elem, color);
      }
    },
    [
      currentVersionNumber,
      laterVersionNum,
      earlierVersionNum,
      switchToVersion,
      doIsolate,
    ],
  );

  const isCurrentLatest = currentVersionNumber === latestVersionNumber;

  const otherVersionNum =
    laterVersionNum !== null && earlierVersionNum !== null
      ? currentVersionNumber === laterVersionNum
        ? earlierVersionNum
        : laterVersionNum
      : null;
  console.log("confirm:", confirm);
  return (
    <Flex
      position="absolute"
      top="60px"
      left="16px"
      zIndex={Z_INDEX.modal}
      w="340px"
      maxH="calc(100% - 80px)"
      bg={COLORS.bg.surface}
      borderRadius={RADII.md}
      boxShadow={SHADOWS.popup}
      overflow="hidden"
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
              <Button size="sm" variant="ghost" onClick={handleBack} p={1}>
                <ArrowLeft size={ICON_SIZES.xs} />
              </Button>
            </Tooltip>
          )}
          <Box ms={SPACING[2]}>
            {result ? (
              <Flex align="center" gap={1} fontSize="xs">
                <SectionTitle>
                  Comparing v{earlierVersionNum}: v{laterVersionNum}
                </SectionTitle>
              </Flex>
            ) : (
              <SectionTitle> Compare Versions</SectionTitle>
            )}
          </Box>
        </Flex>
        <Button size="xs" variant="ghost" onClick={onClose} aria-label="Close">
          ✕
        </Button>
      </Flex>

      {/* ── Version banner (diff view only) ── */}
      {result && laterVersionNum !== null && !confirm && (
        <Flex
          bg={COLORS.bg.elevated}
          px={SPACING[4]}
          py={SPACING[4]}
          align="center"
          justify="space-between"
          borderBottomWidth={BORDER_WIDTHS.sm}
        >
          <Box flexShrink={0}>
            <BodyText>Viewer: Version {currentVersionNumber}</BodyText>
            {!isCurrentLatest && (
              <Flex align="center" mt={SPACING[2]}>
                <TriangleAlert size={ICON_SIZES.xs} />
                <Caption {...{ color: COLORS.text.tertiary, ms: SPACING[2] }}>
                  This is not the latest version
                </Caption>
              </Flex>
            )}
          </Box>
          {otherVersionNum !== null && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => switchToVersion(otherVersionNum)}
            >
              Switch to v{otherVersionNum}
            </Button>
          )}
        </Flex>
      )}

      {/* ── Inline confirmation ── */}
      {confirm && (
        <Box
          px={SPACING[4]}
          py={SPACING[2]}
          bg={COLORS.bg.elevated}
          borderBottomWidth="1px"
          flexShrink={0}
        >
          <Caption {...{ color: COLORS.semantic.warning }}>
            {confirm.message}
          </Caption>
          <Flex gap={SPACING[2]} mt={SPACING[2]}>
            <Button size="xs" onClick={confirm.onConfirm}>
              Yes
            </Button>
            <Button
              size="xs"
              variant="secondary"
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
            <Caption>Select two versions to compare</Caption>
            <Flex gap={SPACING[2]} my={SPACING[4]}>
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
          <DiffView result={result} handleItemClick={handleItemClick} />
        )}
      </Box>
    </Flex>
  );
}
