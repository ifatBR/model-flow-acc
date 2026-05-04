import { SectionTitle } from "@/components/Typography";
import { COLORS, RADII, SPACING } from "@/styles/designTokens";
import { Flex, NativeSelect } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface ViewsListProps {
  views: any[];
  defaultIndex: number;
  onLoadView: (index: number) => void;
}

export function ViewsList({ views, defaultIndex, onLoadView }: ViewsListProps) {
  const [selectedIndex, setSelectedIndex] = useState<string>("");

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
