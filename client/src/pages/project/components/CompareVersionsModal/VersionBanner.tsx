import { Box, Flex } from "@chakra-ui/react";
import { Button } from "@/components/Button";
import {
  BORDER_WIDTHS,
  COLORS,
  ICON_SIZES,
  SPACING,
} from "@/styles/designTokens";
import { BodyText, Caption } from "@/components/Typography";
import { TriangleAlert } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface VersionBannerProps {
  currentVersionNumber: number | null;
  otherVersionNum: number | null;
  isCurrentLatest: boolean;
  switchToVersion: (version: number) => void;
}

export function VersionBanner({
  currentVersionNumber,
  otherVersionNum,
  isCurrentLatest,
  switchToVersion,
}: VersionBannerProps) {
  return (
    <Flex
      bg={COLORS.bg.elevated}
      px={SPACING[4]}
      py={SPACING[4]}
      align="center"
      justify="space-between"
      borderBottomWidth={BORDER_WIDTHS.sm}
    >
      <Box flexShrink={0}>
        <Flex align="center">
          <BodyText {...{ me: SPACING[2] }}>
            Viewer: Version {currentVersionNumber}
          </BodyText>
          {!isCurrentLatest && (
            <Tooltip content="This is not the latest version">
              <TriangleAlert
                size={ICON_SIZES.xs}
                color={COLORS.semantic.warning}
              />
            </Tooltip>
          )}
        </Flex>
      </Box>
      {otherVersionNum !== null && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => switchToVersion(otherVersionNum)}
        >
          Switch to v{otherVersionNum}
        </Button>
      )}
    </Flex>
  );
}
