import { Box, Flex, IconButton } from "@chakra-ui/react";
import { X } from "lucide-react";
import {
  COLORS,
  RADII,
  SHADOWS,
  SPACING,
  Z_INDEX,
} from "@/styles/designTokens";
import { SectionTitle } from "@/components/Typography";
import { getElementDisplayName } from "../../helpers/display.helper";
import {
  FIELD_UNIT,
  getCategoryKey,
  getFormattedValue,
  KEY_DIMENSION_BY_CATEGORY,
  UNIT_LABELS,
} from "../../helpers/properties.helper";
import { useViewerModal } from "@/context/ViewerModal.context.";
import { PropertyRow } from "./PropertyRow";

export interface SelectedElementData {
  properties: {
    category?: string;
    name?: string;
    level?: string;
    material?: string;
    length?: string;
    area?: string;
    height?: string;
    thickness?: string;
    width?: string;
    diameter?: string;
    slope?: string;
    insulation?: string;
  };
}

export function PropertiesModal() {
  const { selectedElement, setShowPropertiesModal } = useViewerModal();
  if (!selectedElement) return;

  const { properties } = selectedElement;

  const {
    category,
    name,
    level,
    material,
    length,
    area,
    height,
    thickness,
    width,
    diameter,
    slope,
    insulation,
  } = properties;

  const categoryKey = getCategoryKey(category);

  const dimensionFields: string[] =
    KEY_DIMENSION_BY_CATEGORY[categoryKey ?? ""] ?? [];

  const dimensionValues: Record<string, string | undefined> = {
    length: length && (Number(length) / 10).toFixed(2),
    area: area && (Number(area) / 10).toFixed(2),
    height: height && (Number(height) / 10).toFixed(2),
    thickness: thickness && (Number(thickness) / 10).toFixed(2),
    width: width && (Number(width) / 10).toFixed(2),
    diameter,
    slope,
    insulation,
  };

  const showSlope =
    categoryKey === "pipes" ||
    categoryKey === "ducts" ||
    (categoryKey === "floors" && slope && slope !== "0");

  const showInsulation = categoryKey === "pipes" || categoryKey === "ducts";

  const displayName = getElementDisplayName({ category, name, level });

  return (
    <Flex
      position="absolute"
      top={SPACING[8]}
      right={SPACING[8]}
      zIndex={Z_INDEX.modal}
      w="300px"
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
        <SectionTitle>{displayName}</SectionTitle>
        <IconButton
          aria-label="Close"
          size="xs"
          variant="ghost"
          color={COLORS.text.secondary}
          onClick={() => setShowPropertiesModal(false)}
        >
          <X size={14} />
        </IconButton>
      </Flex>

      <Box px={SPACING[4]} py={SPACING[2]} overflowY="auto">
        <PropertyRow label="Category" value={category} />
        <PropertyRow label="Name / Type" value={name} />
        <PropertyRow label="Level" value={level} />
        {material !== undefined && material !== "" && (
          <PropertyRow label="Material" value={material} />
        )}

        {dimensionFields.map((field) => {
          const rawValue = dimensionValues[field];
          const val = getFormattedValue(field, rawValue);
          if (!val || val === "0") return null;
          const label = field.charAt(0).toUpperCase() + field.slice(1);
          const unit = UNIT_LABELS[FIELD_UNIT[field]];
          return (
            <PropertyRow key={field} label={label} value={`${val} ${unit}`} />
          );
        })}

        {showSlope && (
          <PropertyRow
            label="Slope"
            value={`${Number(slope).toFixed(2) ?? 0}%`}
          />
        )}
        {showInsulation && (
          <PropertyRow label="Insulation" value={insulation} />
        )}
      </Box>
    </Flex>
  );
}
