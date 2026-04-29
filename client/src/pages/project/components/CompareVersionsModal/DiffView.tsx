import { Box, Tabs } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { ComparisonResult, ListElement } from ".";
import { ItemsList } from "./ItemsList";

const HIGHLIGHT_COLOR = {
  added: { r: 0, g: 1, b: 0 },
  modified: { r: 1, g: 1, b: 0 },
  removed: { r: 1, g: 0, b: 0 },
};
// ─── Types ───────────────────────────────────────────────────────────────────

type TabType = "added" | "modified" | "removed";

interface DiffViewProps {
  result: ComparisonResult;
  handleItemClick: (
    element: ListElement,
    toLaterVer: boolean,
    color: { r: number; g: number; b: number },
  ) => void;
}

export function DiffView({ result, handleItemClick }: DiffViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("added");

  useEffect(() => {
    setActiveTab("added");
  }, []);
  return (
    <Box>
      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value as TabType)}
        size="sm"
      >
        <Tabs.List>
          <Tabs.Trigger value="added" fontSize="xs">
            Added ({result.added.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="modified" fontSize="xs">
            Modified ({result.modified.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="removed" fontSize="xs">
            Removed ({result.removed.length})
          </Tabs.Trigger>
        </Tabs.List>

        {/* Added */}
        <Tabs.Content value="added" p={0}>
          <ItemsList
            items={result.added}
            icon="+"
            color="green.500"
            emptyListMsg="No elements added"
            handleItemClick={(element) =>
              handleItemClick(element, true, HIGHLIGHT_COLOR.added)
            }
          />
        </Tabs.Content>

        {/* Modified */}
        <Tabs.Content value="modified" p={0}>
          <ItemsList
            items={result.modified}
            icon="~"
            color="yellow.500"
            emptyListMsg="No elements modified"
            handleItemClick={(element) =>
              handleItemClick(element, true, HIGHLIGHT_COLOR.modified)
            }
          />
        </Tabs.Content>

        {/* Removed */}
        <Tabs.Content value="removed" p={0}>
          <ItemsList
            items={result.removed}
            icon="~"
            color="red.500"
            emptyListMsg="No elements removed"
            handleItemClick={(element) =>
              handleItemClick(element, false, HIGHLIGHT_COLOR.removed)
            }
          />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}
