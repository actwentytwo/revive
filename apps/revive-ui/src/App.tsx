import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'
import {
  AppShell,
  ChangeLogPageRoute,
  ConfigurationPageRoute,
  DefaultProjectHomeRoute,
  OverviewPageRoute,
  ProjectsPageRoute,
  ProjectWorkspaceRoute,
  VideosPageRoute,
} from './components/AppShell'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppShell />}>
      <Route index element={<DefaultProjectHomeRoute />} />
      <Route path="/projects" element={<ProjectsPageRoute />} />
      <Route path="/project" element={<ProjectWorkspaceRoute />}>
        <Route index element={<Navigate to="/project/overview" replace />} />
        <Route path="overview" element={<OverviewPageRoute />} />
        <Route path="configuration" element={<ConfigurationPageRoute />} />
        <Route path="videos" element={<VideosPageRoute />} />
      </Route>
      <Route path="/changelog" element={<ChangeLogPageRoute />} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Route>,
  ),
)

const App = () => <RouterProvider router={router} />

export default App
