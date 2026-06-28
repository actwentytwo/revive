import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import {
  AppShell,
  ChangeLogPageRoute,
  ConfigurationWorkspacePageRoute,
  ConfigurationPageRoute,
  HomeRoute,
  OverviewPageRoute,
  ProjectsPageRoute,
  ProjectWorkspaceRoute,
  VideosPageRoute,
} from "./components/AppShell";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppShell />}>
      <Route index element={<HomeRoute />} />
      <Route path="/projects" element={<ProjectsPageRoute />} />
      <Route path="/configuration" element={<ConfigurationWorkspacePageRoute />} />
      <Route path="/project/:projectSlug" element={<ProjectWorkspaceRoute />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPageRoute />} />
        <Route path="configuration" element={<ConfigurationPageRoute />} />
        <Route path="videos" element={<VideosPageRoute />} />
      </Route>
      <Route path="/changelog" element={<ChangeLogPageRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ),
);

const App = () => <RouterProvider router={router} />;

export default App;
