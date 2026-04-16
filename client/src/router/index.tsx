import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { AppLayout } from "../components/AppLayout";
import { ViewerPage } from "@/pages/viewer/ViewerPage";
import { LandingPage } from "@/pages/landing/LandingPage";
import { BrowserPage } from "@/pages/browser/BrowserPage";

const routerConfig = [
  { path: ROUTES.LANDING, element: <LandingPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.LANDING} replace /> },
      { path: ROUTES.VIEWER, element: <ViewerPage /> },
      { path: ROUTES.BROWSER, element: <BrowserPage /> },
    ],
  },
];

export const router = createBrowserRouter(routerConfig);
