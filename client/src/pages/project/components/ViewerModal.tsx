import { ApsViewer } from "@/components/ApsViewer";
import { Loader } from "@/components/Loader";
import { CloseButton, Dialog, Flex, Portal } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import type { ItemVersion } from "@/api/project";
import { CompareVersionsModal } from "./CompareVersionsModal";
import { clearIsolateAndHighlight } from "../helpers/viewer.helper";
import { Buffer } from "buffer";
import { COLORS, SIDEBAR, SPACING } from "@/styles/designTokens";
import { ViewsList } from "./CompareVersionsModal/ViewsList";
import { useLayout } from "@/context/LayoutContext";

interface ViewerModalProps {
  fileName: string | null;
  browseUrn: string | null;
  setUrn: (value: string | null) => void;
  versions?: ItemVersion[];
  itemId?: string | null;
  currentVersionNumber?: number;
  onVersionChange?: (urn: string, versionNumber: number) => void;
}

export function ViewerModal({
  fileName,
  browseUrn,
  setUrn,
  versions,
  itemId,
  currentVersionNumber,
  onVersionChange,
}: ViewerModalProps) {
  const { isCollapsed } = useLayout();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedViewIndex, setSelectedViewIndex] = useState<number>(-1);
  const [views, setViews] = useState<any[]>([]);
  const [currentViewName, setCurrentViewName] = useState<string | null>(null);

  const viewerRef = useRef<any>(null);
  const viewerDocRef = useRef<any>(null);
  const versionsButtonRef = useRef<((enabled: boolean) => void) | null>(null);
  const currentViewNameRef = useRef<string | null>(null);

  const hasVersions = versions && versions.length > 1 && itemId;

  useEffect(() => {
    if (selectedViewIndex >= 0 && views.length > 0) {
      const view = views[selectedViewIndex];
      setCurrentViewName(view.data.name);
      currentViewNameRef.current = view.data.name;
      versionsButtonRef.current?.(view.data.role === "3d");
    }
  }, [selectedViewIndex, views]);

  const onCloseCompareVersionModal = () => {
    clearIsolateAndHighlight(viewerRef?.current);
    const latestVersion = versions?.[0];
    if (latestVersion) {
      const encodedUrn = Buffer.from(latestVersion.id).toString("base64");
      onVersionChange?.(encodedUrn, latestVersion.versionNumber);
    }
    setShowCompareModal(false);
  };

  const onLoadView = (index: number) => {
    const view = views[index];
    viewerRef?.current?.loadDocumentNode(viewerDocRef.current, view);
    setCurrentViewName(view.data.name);
    currentViewNameRef.current = view.data.name;
    versionsButtonRef.current?.(view.data.role === "3d");
    setShowCompareModal(false);
  };
  return isLoading ? (
    <Loader />
  ) : (
    <Dialog.Root
      open={!!browseUrn && !isLoading}
      onOpenChange={({ open }) => {
        if (!open) {
          currentViewNameRef.current = null;
          setCurrentViewName(null);
          setViews([]);
          setSelectedViewIndex(-1);
          setUrn(null);
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content h="90vh" maxW="85%" bg={COLORS.bg.elevated}>
            <Dialog.Header>
              <Flex w="100%" justify="space-between" pr={SPACING[6]}>
                <Dialog.Title>{fileName}</Dialog.Title>
                <ViewsList
                  views={views}
                  defaultIndex={selectedViewIndex}
                  onLoadView={onLoadView}
                />
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body position="relative">
              <ApsViewer
                urn={browseUrn}
                setIsLoading={setIsLoading}
                viewerRef={viewerRef}
                viewerDocRef={viewerDocRef}
                versionsButtonRef={versionsButtonRef}
                currentViewNameRef={currentViewNameRef}
                setShowCompareModal={setShowCompareModal}
                setSelectedViewIndex={setSelectedViewIndex}
                setViews={setViews}
              />
              {showCompareModal && hasVersions && onVersionChange && (
                <CompareVersionsModal
                  versions={versions}
                  itemId={itemId}
                  currentVersionNumber={currentVersionNumber}
                  currentViewName={currentViewName}
                  viewerRef={viewerRef}
                  onVersionChange={onVersionChange}
                  onClose={onCloseCompareVersionModal}
                />
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
