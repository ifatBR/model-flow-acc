import { Box, Flex } from "@chakra-ui/react";
import { Button } from "@/components/Button";
import { COLORS, SPACING } from "@/styles/designTokens";
import { Caption } from "@/components/Typography";

interface ConfirmState {
  message: string;
  onConfirm: () => void;
}

interface ConfirmBannerProps {
  confirm: ConfirmState;
  setConfirm: (confirm: ConfirmState | null) => void;
}

export function ConfirmBanner({ confirm, setConfirm }: ConfirmBannerProps) {
  return (
    <Box
      px={SPACING[4]}
      py={SPACING[2]}
      bg={COLORS.bg.elevated}
      borderBottomWidth="1px"
      flexShrink={0}
    >
      <Caption {...{ color: COLORS.semantic.warning }}>
        {confirm.message}
      </Caption>
      <Flex gap={SPACING[2]} mt={SPACING[2]}>
        <Button size="xs" onClick={confirm.onConfirm}>
          Yes
        </Button>
        <Button size="xs" variant="secondary" onClick={() => setConfirm(null)}>
          No
        </Button>
      </Flex>
    </Box>
  );
}
