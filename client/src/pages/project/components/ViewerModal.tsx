import { ApsViewer } from "@/components/ApsViewer";
import { Loader } from "@/components/Loader";
import { CloseButton, Dialog, Flex, Portal } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { CompareVersionsModal } from "./CompareVersionsModal";
import { VersionsModal } from "./VersionsModal";
import { COLORS, SPACING } from "@/styles/designTokens";
import { ViewsList } from "./ViewsList";
import { PropertiesModal } from "./PropertiesModal";
import { useViewerModal } from "@/context/ViewerModal.context.";
import { useProjectPage } from "@/context/ProjectPage.context";

export function ViewerModal() {
  const {
    previewFileName: fileName,
    urn: browseUrn,
    setUrn,
    versions,
    itemId,
    setCurrentVersionNumber,
  } = useProjectPage();

  const {
    showCompareModal,
    setShowCompareModal,
    showVersionsModal,
    setShowVersionsModal,
    showPropertiesModal,
    setShowPropertiesModal,
    selectedElement,
    selectedViewIndex,
    setSelectedViewIndex,
    views,
    setViews,
    setCurrentViewName,
    versionsButtonRef,
    currentViewNameRef,
  } = useViewerModal();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const hasVersions = versions && versions.length > 1 && itemId;

  const onVersionChange = useCallback(
    (newUrn: string, versionNumber: number) => {
      setUrn(newUrn);
      setCurrentVersionNumber(versionNumber);
    },
    [],
  );

  useEffect(() => {
    if (selectedViewIndex >= 0 && views.length > 0) {
      const view = views[selectedViewIndex];
      setCurrentViewName(view.data.name);
      currentViewNameRef.current = view.data.name;
      versionsButtonRef.current?.(view.data.role === "3d");
    }
  }, [selectedViewIndex, views]);

  const onCloseViewerModal = () => {
    currentViewNameRef.current = null;
    setCurrentViewName(null);
    setShowPropertiesModal(false);
    setShowCompareModal(false);
    setShowVersionsModal(false);
    setViews([]);
    setSelectedViewIndex(-1);
    setUrn(null);
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
                <ViewsList />
              </Flex>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body position="relative">
              <ApsViewer urn={browseUrn} setIsLoading={setIsLoading} />
              {showVersionsModal && hasVersions && onVersionChange && (
                <VersionsModal
                  onVersionChange={onVersionChange}
                  onClose={() => setShowVersionsModal(false)}
                />
              )}
              {showCompareModal && hasVersions && onVersionChange && (
                <CompareVersionsModal onVersionChange={onVersionChange} />
              )}
              {showPropertiesModal && selectedElement && <PropertiesModal />}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
