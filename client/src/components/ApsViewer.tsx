import { Box } from "@chakra-ui/react";
import Fish from "./Fish";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/api/auth";
import { setupViewerToolbar } from "@/utils/viewer.utils";
import { useLayout } from "@/context/LayoutContext";
import { SIDEBAR } from "@/styles/designTokens";
import { CompareVersionsModal } from "@/pages/project/components/CompareVersionsModal";
import type { ItemVersion } from "@/api/project";

interface ApsViewerProps {
  urn: string | null;
  setIsLoading: (val: boolean) => void;
  versions?: ItemVersion[];
  itemId?: string | null;
  currentVersionNumber?: number;
  onVersionChange?: (urn: string, versionNumber: number) => void;
}

export function ApsViewer({
  urn,
  setIsLoading,
  versions,
  itemId,
  currentVersionNumber = 0,
  onVersionChange,
}: ApsViewerProps) {
  const [showFish, setShowFish] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const { isCollapsed } = useLayout();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const toolbarCleanupRef = useRef<(() => void) | null>(null);

  const onClickFishBtn = () => {
    setShowFish(true);
  };

  // Use a ref so the toolbar closure always calls the latest handler
  const onClickVersionsButtonRef = useRef<() => void>(() => {});
  onClickVersionsButtonRef.current = () => setShowCompareModal(true);

  const onClickVersionsButton = useCallback(
    () => onClickVersionsButtonRef.current(),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    async function initViewer() {
      if (!containerRef.current || !window.Autodesk) return;

      if (cancelled) return;
      const accessToken = await getAccessToken();
      window.Autodesk.Viewing.Initializer({ accessToken: accessToken }, () => {
        if (!containerRef.current || cancelled) return;
        const viewer = new window.Autodesk.Viewing.GuiViewer3D(
          containerRef.current,
        );

        viewerRef.current = viewer;
        if (!viewer) return;
        viewer.start();

        toolbarCleanupRef.current = setupViewerToolbar(
          viewer,
          onClickVersionsButton,
          onClickFishBtn,
        );

        setIsLoading(false);

        window.Autodesk.Viewing.Document.load(
          `urn:${urn}`,
          (doc: any) => {
            const defaultModel = doc.getRoot().getDefaultGeometry();
            viewer.loadDocumentNode(doc, defaultModel);
          },
          (errCode: number, errMsg: string) => {
            console.error("Viewer load error:", errCode, errMsg);
          },
        );
      });
    }

    initViewer();

    return () => {
      cancelled = true;
      if (toolbarCleanupRef.current) {
        toolbarCleanupRef.current();
        toolbarCleanupRef.current = null;
      }

      if (viewerRef.current) {
        viewerRef.current.finish();
        viewerRef.current = null;
      }
    };
  }, [urn]);

  const hasVersions = versions && versions.length > 1 && itemId;

  return (
    <Box
      w={`calc(100% - ${isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded})`}
      h="100%"
      position="absolute"
    >
      <Box ref={containerRef} position="absolute" w="100%" h="100%" />

      {showFish && (
        <Box position="absolute" zIndex="2" bottom="70px" ml="30%" w={"40%"}>
          <Fish setPlay={setShowFish} />
        </Box>
      )}

      {showCompareModal && hasVersions && onVersionChange && (
        <CompareVersionsModal
          versions={versions}
          itemId={itemId}
          currentVersionNumber={currentVersionNumber}
          viewerRef={viewerRef}
          onVersionChange={onVersionChange}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </Box>
  );
}
