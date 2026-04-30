import { Box, Flex, NativeSelect, Spinner } from "@chakra-ui/react";
import { Caption } from "@/components/Typography";
import { SPACING } from "@/styles/designTokens";
import type { ItemVersion } from "@/api/project";
import { Button } from "@/components/Button";

interface VersionSelcectionProps {
  versions: ItemVersion[];
  comparing: boolean;
  selectedV1: number | null;
  selectedV2: number | null;
  setSelectedV1: (version: number | null) => void;
  setSelectedV2: (version: number | null) => void;
  handleCompare: () => void;
}
export function VersionSelcection({
  versions,
  comparing,
  selectedV1,
  setSelectedV1,
  selectedV2,
  setSelectedV2,
  handleCompare,
}: VersionSelcectionProps) {
  return (
    <Box p={4}>
      <Caption>Select two versions to compare</Caption>
      <Flex gap={SPACING[2]} my={SPACING[4]}>
        <NativeSelect.Root flex={1} size="sm">
          <NativeSelect.Field
            value={selectedV1 ?? ""}
            onChange={(e) =>
              setSelectedV1(e.target.value ? Number(e.target.value) : null)
            }
            fontSize="xs"
          >
            <option value="">Version…</option>
            {versions.map((v) => (
              <option
                key={v.versionNumber}
                value={v.versionNumber}
                disabled={v.versionNumber === selectedV2}
              >
                Version {v.versionNumber}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>

        <NativeSelect.Root flex={1} size="sm">
          <NativeSelect.Field
            value={selectedV2 ?? ""}
            onChange={(e) =>
              setSelectedV2(e.target.value ? Number(e.target.value) : null)
            }
            fontSize="xs"
          >
            <option value="">Version…</option>
            {versions.map((v) => (
              <option
                key={v.versionNumber}
                value={v.versionNumber}
                disabled={v.versionNumber === selectedV1}
              >
                Version {v.versionNumber}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Flex>

      <Button
        w="full"
        size="sm"
        disabled={selectedV1 === null || selectedV2 === null || comparing}
        onClick={handleCompare}
      >
        {comparing ? <Spinner size="xs" /> : "Compare"}
      </Button>
    </Box>
  );
}
