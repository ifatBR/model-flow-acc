import { BodyText, Caption } from "@/components/Typography";
import { SPACING, COLORS } from "@/styles/designTokens";
import { Flex } from "@chakra-ui/react";

export function PropertyRow({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <Flex
      justify="space-between"
      align="flex-start"
      py={SPACING[2]}
      borderBottomWidth="1px"
      borderColor={COLORS.bg.elevated}
      gap={SPACING[4]}
    >
      <Caption>{label}</Caption>
      <BodyText>{value}</BodyText>
    </Flex>
  );
}
