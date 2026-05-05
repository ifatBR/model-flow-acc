import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { AppLayout } from "../components/AppLayout";
import { ViewerPage } from "@/pages/viewer/ViewerPage";
import { LandingPage } from "@/pages/landing/LandingPage";
import { ProjectPage } from "@/pages/project/ProjectPage";
import { LayoutProvider } from "@/context/LayoutContext";
import { RouteErrorPage } from "@/components/RouteErrorPage";
import { ProjectPageProvider } from "@/context/ProjectPage.context";

const routerConfig = [
  { path: ROUTES.LANDING, element: <LandingPage /> },
  {
    path: "/",
    element: (
      <LayoutProvider>
        <AppLayout />
      </LayoutProvider>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to={ROUTES.LANDING} replace /> },
      { path: ROUTES.VIEWER, element: <ViewerPage /> },
      {
        path: ROUTES.PROJECT,
        element: (
          <ProjectPageProvider>
            <ProjectPage />
          </ProjectPageProvider>
        ),
      },
    ],
  },
];

export const router = createBrowserRouter(routerConfig);
