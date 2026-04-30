import { Box, Flex } from "@chakra-ui/react";

import { Button } from "@/components/Button";
import { ICON_SIZES, SPACING } from "@/styles/designTokens";
import { SectionTitle } from "@/components/Typography";
import { Tooltip } from "@/components/ui/tooltip";
import { ArrowLeft } from "lucide-react";
import type { ComparisonResult } from ".";
interface CompareHeaderProps {
  result: ComparisonResult | null;
  earlierVersionNum: number | null;
  laterVersionNum: number | null;
  handleBack: () => void;
  onClose: () => void;
}

export function CompareHeader({
  result,
  earlierVersionNum,
  laterVersionNum,
  handleBack,
  onClose,
}: CompareHeaderProps) {
  return (
    <Flex
      align="center"
      justify="space-between"
      px={4}
      py={3}
      borderBottomWidth="1px"
      flexShrink={0}
    >
      <Box ms={SPACING[2]}>
        {result ? (
          <Flex align="center" gap={2}>
            <Tooltip content="Select versions">
              <Button size="sm" variant="ghost" onClick={handleBack} p={1}>
                <ArrowLeft size={ICON_SIZES.xs} />
              </Button>
            </Tooltip>
            <Flex align="center" gap={1} fontSize="xs">
              <SectionTitle>
                Comparing v{earlierVersionNum}: v{laterVersionNum}
              </SectionTitle>
            </Flex>
          </Flex>
        ) : (
          <SectionTitle> Compare Versions</SectionTitle>
        )}
      </Box>
      <Button size="xs" variant="ghost" onClick={onClose} aria-label="Close">
        ✕
      </Button>
    </Flex>
  );
}
