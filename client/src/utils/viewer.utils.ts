export function setupViewerToolbar(
  viewer: Autodesk.Viewing.GuiViewer3D,
  onClickVersionsButton: () => void,
  onClickFishBtn: () => void,
) {
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
    onClickVersionsButton();
  };

  const group = new window.Autodesk.Viewing.UI.ControlGroup("demo-group");
  group.addControl(fishButton);

  group.addControl(versionsButton);
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

  //The returned cleanup function that we can run later in the useEffect return.
  return () => {
    viewer.removeEventListener(
      window.Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
      addToolbar,
    );

    const existingGroup = viewer.toolbar?.getControl("my-custom-group");
    if (existingGroup) {
      viewer.toolbar.removeControl(existingGroup);
    }
  };
}
