import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { IncidentsTable } from "./pages/IncidentsTable";
import IncidentDetail from "./pages/IncidentDetail";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "incidents", Component: IncidentsTable },
      { path: "incidents/:id", Component: IncidentDetail },
      { path: "*", Component: NotFound },
    ],
  },
]);
