import type { SelectedElementData } from "@/pages/project/components/PropertiesModal";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type RefObject,
} from "react";

type ViewerModalContextType = {
  showCompareModal: boolean;
  setShowCompareModal: (value: boolean) => void;
  showVersionsModal: boolean;
  setShowVersionsModal: (value: boolean) => void;
  showPropertiesModal: boolean;
  setShowPropertiesModal: (value: boolean) => void;
  selectedElement: SelectedElementData | null;
  setSelectedElement: (value: SelectedElementData | null) => void;
  selectedViewIndex: number;
  setSelectedViewIndex: (value: number) => void;
  views: any[];
  setViews: (value: any) => void;
  currentViewName: string | null;
  setCurrentViewName: (value: string | null) => void;
  viewerRef: RefObject<any>;
  viewerDocRef: RefObject<any>;
  versionsButtonRef: RefObject<((enabled: boolean) => void) | null>;
  currentViewNameRef: RefObject<string | null>;
};

const ViewerModalContext = createContext<ViewerModalContextType | null>(null);

export function ViewerModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [selectedElement, setSelectedElement] =
    useState<SelectedElementData | null>(null);
  const [selectedViewIndex, setSelectedViewIndex] = useState<number>(-1);
  const [views, setViews] = useState<any[]>([]);
  const [currentViewName, setCurrentViewName] = useState<string | null>(null);

  const viewerRef = useRef<any>(null);
  const viewerDocRef = useRef<any>(null);
  const versionsButtonRef = useRef<(enabled: boolean) => void | null>(null);
  const currentViewNameRef = useRef<string | null>(null);

  const value = {
    showCompareModal,
    setShowCompareModal,
    showVersionsModal,
    setShowVersionsModal,
    showPropertiesModal,
    setShowPropertiesModal,
    selectedElement,
    setSelectedElement,
    selectedViewIndex,
    setSelectedViewIndex,
    views,
    setViews,
    currentViewName,
    setCurrentViewName,
    viewerRef,
    viewerDocRef,
    versionsButtonRef,
    currentViewNameRef,
  };

  return (
    <ViewerModalContext.Provider value={value}>
      {children}
    </ViewerModalContext.Provider>
  );
}

export function useViewerModal() {
  const ctx = useContext(ViewerModalContext);
  if (!ctx)
    throw new Error("useViewerModal must be used inside ViewerModalProvider");
  return ctx;
}
