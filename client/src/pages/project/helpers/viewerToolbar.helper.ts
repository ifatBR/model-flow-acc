export function setupViewerToolbar(
  viewer: Autodesk.Viewing.GuiViewer3D,
  onClickVersionsButton: () => void,
  onClickVersionsListButton: () => void,
  onClickFishBtn: () => void,
  onClickPropertiesButton: () => void,
): {
  cleanup: () => void;
  setVersionsEnabled: (enabled: boolean) => void;
  setPropertiesEnabled: (enabled: boolean) => void;
} {
  const fishButton = new window.Autodesk.Viewing.UI.Button("fish-button");
  fishButton.setToolTip("Fish");
  fishButton.onClick = () => {
    onClickFishBtn();
  };

  const versionsButton = new window.Autodesk.Viewing.UI.Button(
    "versions-button",
  );
  versionsButton.setToolTip("Compare Versions");
  versionsButton.onClick = () => {
    if (
      versionsButton.getState() !==
      window.Autodesk.Viewing.UI.Button.State.DISABLED
    ) {
      onClickVersionsButton();
    }
  };

  const versionsListButton = new window.Autodesk.Viewing.UI.Button(
    "versions-list-button",
  );
  versionsListButton.setToolTip("Version List");
  versionsListButton.onClick = () => {
    onClickVersionsListButton();
  };

  const propertiesButton = new window.Autodesk.Viewing.UI.Button(
    "properties-button",
  );
  propertiesButton.setToolTip("Element Properties");
  propertiesButton.setState(window.Autodesk.Viewing.UI.Button.State.DISABLED);
  propertiesButton.onClick = () => {
    if (
      propertiesButton.getState() !==
      window.Autodesk.Viewing.UI.Button.State.DISABLED
    ) {
      onClickPropertiesButton();
    }
  };

  const setVersionsEnabled = (enabled: boolean) => {
    versionsButton.setState(
      enabled
        ? window.Autodesk.Viewing.UI.Button.State.INACTIVE
        : window.Autodesk.Viewing.UI.Button.State.DISABLED,
    );
  };

  const setPropertiesEnabled = (enabled: boolean) => {
    propertiesButton.setState(
      enabled
        ? window.Autodesk.Viewing.UI.Button.State.INACTIVE
        : window.Autodesk.Viewing.UI.Button.State.DISABLED,
    );
  };

  const group = new window.Autodesk.Viewing.UI.ControlGroup("demo-group");
  group.addControl(fishButton);
  group.addControl(versionsButton);
  group.addControl(versionsListButton);
  group.addControl(propertiesButton);

  const addToolbar = () => {
    if (!viewer.toolbar?.getControl("demo-group")) {
      viewer.toolbar.addControl(group);
    }
  };

  if (viewer.toolbar) {
    addToolbar();
  } else {
    viewer.addEventListener(
      window.Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
      addToolbar,
    );
  }

  return {
    setVersionsEnabled,
    setPropertiesEnabled,
    cleanup: () => {
      viewer.removeEventListener(
        window.Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        addToolbar,
      );
      const existingGroup = viewer.toolbar?.getControl("demo-group");
      if (existingGroup) {
        viewer.toolbar.removeControl(existingGroup);
      }
    },
  };
}

export const removeBuiltInButtons = (viewer: Autodesk.Viewing.GuiViewer3D) => {
  const settingsTools = viewer.toolbar?.getControl("settingsTools");

  if (settingsTools) {
    for (const id of ["toolbar-propertiesTool", "toolbar-modelStructureTool"]) {
      const btn = (settingsTools as any).getControl(id);
      if (btn) (settingsTools as any).removeControl(btn);
    }
  }
  const modelTools = viewer.toolbar?.getControl("modelTools");
  if (modelTools) {
    for (const id of ["toolbar-explodeTool"]) {
      const btn = (modelTools as any).getControl(id);
      if (btn) (modelTools as any).removeControl(btn);
    }
  }

  const navTools = viewer.toolbar?.getControl("navTools");
  if (navTools) {
    for (const id of ["toolbar-bimWalkTool", "toolbar-cameraSubmenuTool"]) {
      const btn = (navTools as any).getControl(id);
      if (btn) (navTools as any).removeControl(btn);
    }
  }
};
