import type { ItemVersion } from "@/api/project";
import { createContext, useContext, useState } from "react";

type ProjectPageContextType = {
  previewFileName: string | null;
  setPreviewFileName: (value: string | null) => void;
  versions: ItemVersion[];
  setVersions: (value: ItemVersion[]) => void;
  urn: string | null;
  setUrn: (value: string | null) => void;
  itemId: string | null;
  setItemId: (value: string | null) => void;
  currentVersionNumber: number;
  setCurrentVersionNumber: (value: number) => void;
};
const ProjectPageContext = createContext<ProjectPageContextType | null>(null);

export function ProjectPageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [urn, setUrn] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [versions, setVersions] = useState<ItemVersion[]>([]);
  const [itemId, setItemId] = useState<string | null>(null);
  const [currentVersionNumber, setCurrentVersionNumber] = useState(0);

  const value = {
    previewFileName,
    setPreviewFileName,
    versions,
    setVersions,
    urn,
    setUrn,
    itemId,
    setItemId,
    currentVersionNumber,
    setCurrentVersionNumber,
  };
  return (
    <ProjectPageContext.Provider value={value}>
      {children}
    </ProjectPageContext.Provider>
  );
}

export function useProjectPage() {
  const ctx = useContext(ProjectPageContext);
  if (!ctx)
    throw new Error("useProjectPage must be used inside ProjectPageProvider");
  return ctx;
}
