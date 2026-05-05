import { SectionTitle } from "@/components/Typography";
import { useViewerModal } from "@/context/ViewerModal.context.";
import { COLORS, RADII, SPACING } from "@/styles/designTokens";
import { Flex, NativeSelect } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function ViewsList() {
  const {
    views,
    selectedViewIndex: defaultIndex,
    viewerRef,
    viewerDocRef,
    currentViewNameRef,
    versionsButtonRef,
    setShowCompareModal,
    setCurrentViewName,
  } = useViewerModal();
  const [selectedIndex, setSelectedIndex] = useState<string>("");

  const onLoadView = async (index: number) => {
    const view = views[index];
    viewerRef?.current?.loadDocumentNode(viewerDocRef.current, view);

    setCurrentViewName(view.data.name);
    currentViewNameRef.current = view.data.name;
    versionsButtonRef.current?.(view.data.role === "3d");
    setShowCompareModal(false);
  };

  useEffect(() => {
    setSelectedIndex(defaultIndex >= 0 ? String(defaultIndex) : "");
  }, [views, defaultIndex]);

  return (
    <Flex align="center">
      <SectionTitle>Views:</SectionTitle>
      <NativeSelect.Root
        flex={1}
        size="sm"
        maxW="300px"
        bg={COLORS.bg.base}
        borderRadius={RADII.sm}
        ms={SPACING[2]}
      >
        <NativeSelect.Field
          value={selectedIndex}
          borderRadius={RADII.sm}
          onChange={(e) => {
            const idx = e.target.value;
            setSelectedIndex(idx);
            if (idx !== "") {
              onLoadView(parseInt(idx));
            }
          }}
          fontSize="xs"
        >
          {views.length ? (
            views.map((v, i) => (
              <option key={v.id} value={i}>
                {v.data.name}
              </option>
            ))
          ) : (
            <option>Loading views...</option>
          )}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Flex>
  );
}
