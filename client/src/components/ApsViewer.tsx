import { Box } from "@chakra-ui/react";
import Fish from "./Fish";
import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/api/auth";
import {
  removeBuiltInButtons,
  setupViewerToolbar,
} from "@/pages/project/helpers/viewerToolbar.helper";
import { useViewerModal } from "@/context/ViewerModal.context.";

interface ApsViewerProps {
  urn: string | null;
  setIsLoading: (val: boolean) => void;
  onRawElementSelected: (rawResult: any | null) => void;
}

export function ApsViewer({
  urn,
  setIsLoading,
  onRawElementSelected,
}: ApsViewerProps) {
  const {
    viewerRef,
    viewerDocRef,
    versionsButtonRef,
    currentViewNameRef,
    setShowCompareModal,
    setShowVersionsModal,
    setShowPropertiesModal,
    setSelectedViewIndex,
    setViews,
  } = useViewerModal();
  const [showFish, setShowFish] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const toolbarCleanupRef = useRef<(() => void) | null>(null);
  const setPropertiesEnabledRef = useRef<((enabled: boolean) => void) | null>(
    null,
  );

  const onClickFishBtn = () => {
    setShowFish(true);
  };

  const onClickVersionsButtonRef = useRef<() => void>(() => {});
  onClickVersionsButtonRef.current = () => setShowCompareModal(true);
  const onClickVersionsButton = () => onClickVersionsButtonRef.current();

  const onClickVersionsListButtonRef = useRef<() => void>(() => {});
  onClickVersionsListButtonRef.current = () => setShowVersionsModal(true);
  const onClickVersionsListButton = () =>
    onClickVersionsListButtonRef.current();

  const onClickPropertiesButtonRef = useRef<() => void>(() => {});
  onClickPropertiesButtonRef.current = () => setShowPropertiesModal(true);
  const onClickPropertiesButton = () => onClickPropertiesButtonRef.current();

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

        const { cleanup, setVersionsEnabled, setPropertiesEnabled } =
          setupViewerToolbar(
            viewer,
            onClickVersionsButton,
            onClickVersionsListButton,
            onClickFishBtn,
            onClickPropertiesButton,
          );
        toolbarCleanupRef.current = cleanup;
        versionsButtonRef.current = setVersionsEnabled;
        setPropertiesEnabledRef.current = setPropertiesEnabled;

        viewer.addEventListener(
          window.Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          (event: any) => {
            const dbIds: number[] = event.dbIdArray ?? [];
            if (dbIds.length === 0) {
              setPropertiesEnabledRef.current?.(false);
              onRawElementSelected(null);
              return;
            }
            setPropertiesEnabledRef.current?.(true);
            viewer.getProperties(dbIds[0], (result: any) => {
              onRawElementSelected(result);
            });
          },
        );

        viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, () => {
          removeBuiltInButtons(viewer);

          // some controls are added slightly later
          setTimeout(() => removeBuiltInButtons(viewer), 500);
        });

        setIsLoading(false);

        window.Autodesk.Viewing.Document.load(
          `urn:${urn}`,
          (doc: any) => {
            const root = doc.getRoot();
            const viewables = root.search({ type: "geometry" });
            const views3d = viewables.filter((v: any) => v.data.role === "3d");
            const views2d = viewables.filter((v: any) => v.data.role === "2d");
            const allViews = [...views3d, ...views2d];

            const defaultModel = root.getDefaultGeometry();
            const restoredView = currentViewNameRef.current
              ? (views3d.find(
                  (v: any) => v.data.name === currentViewNameRef.current,
                ) ?? defaultModel)
              : defaultModel;

            viewer.loadDocumentNode(doc, restoredView);
            viewerDocRef.current = doc;
            setViews(allViews);
            setSelectedViewIndex(allViews.indexOf(restoredView));
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
