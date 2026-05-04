import { ApsViewer } from "@/components/ApsViewer";
import { Loader } from "@/components/Loader";
import { CloseButton, Dialog, Flex, Portal } from "@chakra-ui/react";
import { useRef, useState } from "react";
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
  const [defaultViewIndex, setDefaultViewIndex] = useState<number>(-1);
  const [views, setViews] = useState<any[]>([]);

  const viewerRef = useRef<any>(null);
  const viewerDocRef = useRef<any>(null);

  const hasVersions = versions && versions.length > 1 && itemId;

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
    viewerRef?.current?.loadDocumentNode(viewerDocRef.current, views[index]);
  };
  return isLoading ? (
    <Loader />
  ) : (
    <Dialog.Root
      open={!!browseUrn && !isLoading}
      onOpenChange={({ open }) => {
        if (!open) {
          setUrn(null);
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            h="90vh"
            maxW="85%"
            ms={`calc(${SPACING[5]} + ${isCollapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded})`}
            bg={COLORS.bg.elevated}
          >
            <Dialog.Header>
              <Flex w="100%" justify="space-between" pr={SPACING[6]}>
                <Dialog.Title>{fileName}</Dialog.Title>
                <ViewsList
                  views={views}
                  defaultIndex={defaultViewIndex}
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
                setShowCompareModal={setShowCompareModal}
                setDefaultViewIndex={setDefaultViewIndex}
                setViews={setViews}
              />
              {showCompareModal && hasVersions && onVersionChange && (
                <CompareVersionsModal
                  versions={versions}
                  itemId={itemId}
                  currentVersionNumber={currentVersionNumber}
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
