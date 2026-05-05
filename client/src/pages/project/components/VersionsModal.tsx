import { Box, Flex, IconButton } from "@chakra-ui/react";
import { X } from "lucide-react";
import type { ItemVersion } from "@/api/project";
import {
  COLORS,
  RADII,
  SHADOWS,
  SPACING,
  Z_INDEX,
} from "@/styles/designTokens";
import { BodyText, Caption, SectionTitle } from "@/components/Typography";
import { useViewerModal } from "@/context/ViewerModal.context.";
import { Buffer } from "buffer";
import { useProjectPage } from "@/context/ProjectPage.context";

interface VersionsModalProps {
  onVersionChange: (urn: string, version: number) => void;
  onClose: () => void;
}

export function VersionsModal({
  onVersionChange,
  onClose,
}: VersionsModalProps) {
  const { setShowVersionsModal, setShowPropertiesModal } = useViewerModal();
  const { versions, currentVersionNumber } = useProjectPage();
  const onSelectVersion = (versionNumber: number) => {
    const target = versions?.find((v) => v.versionNumber === versionNumber);
    if (target) {
      const encodedUrn = Buffer.from(target.id).toString("base64");
      onVersionChange?.(encodedUrn, versionNumber);
      setShowPropertiesModal(false);
    }
    setShowVersionsModal(false);
  };

  return (
    <Flex
      position="absolute"
      top={SPACING[8]}
      left={SPACING[8]}
      zIndex={Z_INDEX.modal}
      w="280px"
      maxH="calc(100% - 80px)"
      bg={COLORS.bg.surface}
      borderRadius={RADII.md}
      boxShadow={SHADOWS.popup}
      overflow="hidden"
      flexDirection="column"
    >
      <Flex
        align="start"
        justify="space-between"
        px={SPACING[4]}
        py={SPACING[3]}
        borderBottomWidth="1px"
        borderColor={COLORS.bg.elevated}
      >
        <SectionTitle>Versions</SectionTitle>
        <IconButton
          aria-label="Close"
          size="xs"
          variant="ghost"
          color={COLORS.text.secondary}
          onClick={onClose}
        >
          <X size={14} />
        </IconButton>
      </Flex>

      <Box overflowY="auto" flex={1}>
        {versions.map((v) => {
          const isCurrent = currentVersionNumber === v.versionNumber;
          return (
            <Flex
              key={v.id}
              px={SPACING[4]}
              py={SPACING[3]}
              cursor={isCurrent ? "default" : "pointer"}
              _hover={{ bg: COLORS.bg.elevated }}
              align="center"
              justify="space-between"
              borderBottomWidth="1px"
              borderColor={COLORS.bg.elevated}
              bg={isCurrent ? COLORS.bg.elevated : undefined}
              onClick={() => {
                if (!isCurrent) onSelectVersion(v.versionNumber);
              }}
            >
              <BodyText>Version {v.versionNumber}</BodyText>
              {isCurrent && <Caption>Current</Caption>}
            </Flex>
          );
        })}
      </Box>
    </Flex>
  );
}
