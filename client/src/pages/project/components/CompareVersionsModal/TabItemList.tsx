import type { ModelElement } from "@/api/project";
import { BodyText, ListText } from "../../../../components/Typography";
import type { ListElement } from ".";
import { Box } from "@chakra-ui/react";
import { COLORS, SPACING } from "@/styles/designTokens";
import { getChangeDescription } from "../../helpers/display.helper";

interface TabItemListProps {
  items: ListElement[];
  icon: string;
  color: string;
  emptyListMsg: string;
  handleItemClick: (elem: ModelElement) => void;
}
export function TabItemList({
  items,
  icon,
  color,
  emptyListMsg,
  handleItemClick,
}: TabItemListProps) {
  function getElementDisplayName(elem: ModelElement): string {
    const { category, name, level } = elem.properties;
    const cat = category ?? "Unknown";
    const lvl = level ? ` (${level})` : "";
    if (name) return `${cat} ${name}${lvl}`;
    return `${cat}${lvl}`;
  }

  return (
    <Box>
      {items.length === 0 ? (
        <Box p={SPACING[4]}>
          <BodyText>{emptyListMsg}</BodyText>
        </Box>
      ) : (
        items.map((element) => (
          <Box
            key={element.externalId}
            px={SPACING[4]}
            py={SPACING[2]}
            cursor="pointer"
            _hover={{ bg: COLORS.highlight.tertiary }}
            borderBottomWidth="1px"
            onClick={() => handleItemClick(element)}
          >
            <ListText color={color}>
              {icon} {getElementDisplayName(element)}
            </ListText>
            {element?.changes?.map((change, i) => (
              <ListText key={i} color={COLORS.text.secondary}>
                • {getChangeDescription(change)}
              </ListText>
            ))}
          </Box>
        ))
      )}
    </Box>
  );
}
