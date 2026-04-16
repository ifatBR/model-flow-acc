import { useEffect, useRef, useState } from "react";
import { UploadMenu } from "../../components/UploadMenu";
import { Box } from "@chakra-ui/react";
import { Button } from "../../components/Button";
import { useAuth } from "@/context/AuthContext";
import { SIDEBAR } from "@/styles/designTokens";
import { useLayout } from "@/context/LayoutContext";

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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);

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
        viewer.start();
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
      if (viewerRef.current) {
        viewerRef.current.finish();
        viewerRef.current = null;
      }
    };
  }, [urn]);

  return urn ? (
    <Box
      w={`calc(100%-${isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded}`}
      position="absolute"
    >
      <Box
        position="absolute"
        ml={SIDEBAR.widthCollapsed}
        top="40px"
        zIndex="2"
      >
        <Button onClick={() => setUrn("")}>Clear model</Button>
      </Box>
      <Box
        ref={containerRef}
        w={`calc(100%-${isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded}`}
        h="100vh"
      />
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
