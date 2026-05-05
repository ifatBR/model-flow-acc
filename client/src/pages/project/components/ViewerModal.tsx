import { ApsViewer } from "@/components/ApsViewer";
import { Loader } from "@/components/Loader";
import { CloseButton, Dialog, Flex, Portal } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { ItemVersion } from "@/api/project";
import { CompareVersionsModal } from "./CompareVersionsModal";
import { VersionsModal } from "./VersionsModal";
import {
  clearIsolateAndHighlight,
  parseViewerElement,
} from "../helpers/viewer.helper";
import { Buffer } from "buffer";
import { COLORS, SPACING } from "@/styles/designTokens";
import { ViewsList } from "./ViewsList";
import { useLayout } from "@/context/LayoutContext";
import { PropertiesModal } from "./PropertiesModal";
import { useViewerModal } from "@/context/ViewerModal.context.";

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
  useLayout();
  const {
    showCompareModal,
    setShowCompareModal,
    showVersionsModal,
    setShowVersionsModal,
    showPropertiesModal,
    setShowPropertiesModal,
    selectedElement,
    setSelectedElement,
    selectedViewIndex,
    setSelectedViewIndex,
    views,
    setViews,
    currentViewName,
    setCurrentViewName,
    viewerRef,
    viewerDocRef,
    versionsButtonRef,
    currentViewNameRef,
  } = useViewerModal();

  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const onCloseViewerModal = () => {
    currentViewNameRef.current = null;
    setCurrentViewName(null);
    setShowPropertiesModal(false);
    setViews([]);
    setSelectedViewIndex(-1);
    setUrn(null);
  };

  const onLoadView = async (index: number) => {
    const view = views[index];
    viewerRef?.current?.loadDocumentNode(viewerDocRef.current, view);

    setCurrentViewName(view.data.name);
    currentViewNameRef.current = view.data.name;
    versionsButtonRef.current?.(view.data.role === "3d");
    setShowCompareModal(false);
  };

  const onRawElementSelected = (rawResult: any | null) => {
    if (rawResult === null) {
      setSelectedElement(null);
      return;
    }
    setSelectedElement(parseViewerElement(rawResult));
  };

  const onSelectVersion = (versionNumber: number) => {
    const target = versions?.find((v) => v.versionNumber === versionNumber);
    if (target) {
      const encodedUrn = Buffer.from(target.id).toString("base64");
      onVersionChange?.(encodedUrn, versionNumber);
    }
    setShowVersionsModal(false);
  };

  return isLoading ? (
    <Loader />
  ) : (
    <Dialog.Root
      open={!!browseUrn && !isLoading}
      onOpenChange={({ open }) => {
        if (!open) {
          onCloseViewerModal();
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
                onRawElementSelected={onRawElementSelected}
              />
              {showVersionsModal && hasVersions && onVersionChange && (
                <VersionsModal
                  versions={versions}
                  currentVersionNumber={currentVersionNumber}
                  onSelectVersion={onSelectVersion}
                  onClose={() => setShowVersionsModal(false)}
                />
              )}
              {showCompareModal && hasVersions && onVersionChange && (
                <CompareVersionsModal
                  versions={versions}
                  itemId={itemId}
                  currentVersionNumber={currentVersionNumber}
                  currentViewName={currentViewName}
                  viewerRef={viewerRef}
                  onVersionChange={onVersionChange}
                  onClosePropertiesModal={() => setShowPropertiesModal(false)}
                  onClose={onCloseCompareVersionModal}
                />
              )}
              {showPropertiesModal && selectedElement && (
                <PropertiesModal
                  element={selectedElement}
                  onClose={() => setShowPropertiesModal(false)}
                />
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
