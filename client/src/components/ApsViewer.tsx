import { useEffect, useRef, useState } from "react";
import { UploadMenu } from "./UploadMenu";
import { Box } from "@chakra-ui/react";
import { Button } from "./button";

declare global {
  interface Window {
    Autodesk: any;
  }
}

type ApsViewerProps = { accessToken: string };

export function ApsViewer({ accessToken }: ApsViewerProps) {
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
    <Box>
      <Box position="absolute" top="20px" left="20px" zIndex="2">
        <Button onClick={() => setUrn("")}>Clear model</Button>
      </Box>
      <Box ref={containerRef} w="100%" h="100vh" />
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
