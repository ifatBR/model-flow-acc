import { useEffect, useRef, useState } from "react";
import { UploadMenu } from "../../components/UploadMenu";
import { Box } from "@chakra-ui/react";
import { Button } from "../../components/Button";
import { useAuth } from "@/context/AuthContext";
import { SIDEBAR } from "@/styles/designTokens";
import { useLayout } from "@/context/LayoutContext";
import { setupViewerToolbar } from "@/utils/viewer.utils";
import "@/styles/css/ViewerButton.scss";
import Fish from "@/components/Fish";

declare global {
  interface Window {
    Autodesk: any;
  }
}

export function ViewerPage() {
  const { accessToken } = useAuth();
  const { isCollapsed } = useLayout();
  const [urn, setUrn] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFish, setShowFish] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const toolbarCleanupRef = useRef<(() => void) | null>(null);

  const onClickBtn = () => {
    setShowFish(true);
  };
  useEffect(() => {
    let cancelled = false;
    async function initViewer() {
      if (!containerRef.current || !window.Autodesk) return;

      if (cancelled) return;

      window.Autodesk.Viewing.Initializer({ accessToken: accessToken }, () => {
        if (!containerRef.current || cancelled) return;
        const viewer = new window.Autodesk.Viewing.GuiViewer3D(
          containerRef.current,
        );

        viewerRef.current = viewer;
        if (!viewer) return;
        viewer.start();

        toolbarCleanupRef.current = setupViewerToolbar(viewer, onClickBtn);

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

  return urn ? (
    <Box
      id="viewerPAge"
      w={`calc(100% - ${isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded})`}
      h="100vh"
      position="absolute"
    >
      <Box
        position="absolute"
        left="40px"
        top="40px"
        zIndex="2"
        w="300px"
        h="300px"
      >
        <Button onClick={() => setUrn("")}>Clear model</Button>
      </Box>
      <Box ref={containerRef} position="absolute" w="100%" h="100vh" />
      {showFish && (
        <Box position="absolute" zIndex="2" bottom="70px" ml="30%" w={"40%"}>
          <Fish setPlay={setShowFish} />
        </Box>
      )}
    </Box>
  ) : (
    <UploadMenu
      accessToken={accessToken}
      setUrn={setUrn}
      setIsLoading={setIsLoading}
      isLoading={isLoading}
    />
  );
}
