import { Box } from "@chakra-ui/react";
import Fish from "./Fish";
import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/api/auth";
import { setupViewerToolbar } from "@/utils/viewer.utils";

interface ApsViewerProps {
  urn: string | null;
  viewerRef: any;
  viewerDocRef: any;
  setIsLoading: (val: boolean) => void;
  setShowCompareModal: (val: boolean) => void;
  setDefaultViewIndex: (idx: number) => void;
  setViews: (views: any) => void;
}

export function ApsViewer({
  urn,
  viewerRef,
  viewerDocRef,
  setIsLoading,
  setShowCompareModal,
  setDefaultViewIndex,
  setViews,
}: ApsViewerProps) {
  const [showFish, setShowFish] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const toolbarCleanupRef = useRef<(() => void) | null>(null);

  const onClickFishBtn = () => {
    setShowFish(true);
  };

  // Use a ref so the toolbar closure always calls the latest handler
  const onClickVersionsButtonRef = useRef<() => void>(() => {});
  onClickVersionsButtonRef.current = () => setShowCompareModal(true);

  const onClickVersionsButton = () => onClickVersionsButtonRef.current();

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

            const root = doc.getRoot();

            const viewables = root.search({
              type: "geometry",
            });
            const views3d = viewables.filter((v: any) => v.data.role === "3d");
            const views2d = viewables.filter((v: any) => v.data.role === "2d");
            const allViews = [...views3d, ...views2d];
            viewerDocRef.current = doc;
            setViews(allViews);
            setDefaultViewIndex(
              allViews.findIndex(
                (v) => v.data.guide === defaultModel.data.guide,
              ),
            );
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

  return (
    <Box w="100%" maxW="100%" h="100%" position="relative">
      <Box ref={containerRef} w="100%" maxW="100%" h="100%" />
      {showFish && (
        <Box position="absolute" zIndex="2" bottom="70px" ml="30%" w="40%">
          <Fish setPlay={setShowFish} />
        </Box>
      )}
    </Box>
  );
}
