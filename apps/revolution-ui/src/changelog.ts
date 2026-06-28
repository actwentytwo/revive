export interface ChangeLogEntry {
  version: string;
  date: string;
  title: string;
  summary: string;
  highlights: string[];
  commitRefs?: string[];
  status: "Live" | "In Progress" | "Planned";
}

export const changelog: ChangeLogEntry[] = [
  {
    version: "0.2.0",
    date: "2026-06-29",
    title: "Raven parity milestone release",
    summary:
      "REVOLUTION now ships with Raven-aligned engineering guardrails, CI quality gates, structured test suites, and documented release boundaries.",
    highlights: [
      "Turbo-based workspace orchestration with unified check/lint/test/format/version workflows",
      "Prettier + Husky + lint-staged standards with CI gate enforcement",
      "UI/API architecture refactors and dedicated videos domain module",
      "Unit and integration test layout for API and UI with baseline coverage thresholds",
      "Shared-package boundary guardrails with automated enforcement",
    ],
    commitRefs: ["fc51824", "a0d95df", "1195abd", "e5eeba4", "34c7976"],
    status: "Live",
  },
  {
    version: "0.6",
    date: "2026-06-28",
    title: "Shared platform configurations",
    summary:
      "REVOLUTION now lets teams save named platform configurations once and reuse them across projects.",
    highlights: [
      "Create reusable configurations such as Production, Pre-Prod, and Dev",
      "Store product version details alongside each saved configuration",
      "Choose source and destination configurations inside each migration project",
    ],
    commitRefs: ["6206cb1", "1372059", "adb6ed2"],
    status: "Live",
  },
  {
    version: "0.5",
    date: "2026-06-27",
    title: "Projects are now saved and reusable",
    summary:
      "Projects are now saved through the API so operators can return to the same migration project without rebuilding it in the browser.",
    highlights: [
      "Projects are stored in the database instead of only in local browser storage",
      "The app shows a dedicated API offline page when the backend is unavailable",
      "Project setup stays reusable between sessions",
    ],
    commitRefs: ["4e80562", "1a7bcb1"],
    status: "Live",
  },
  {
    version: "0.2",
    date: "2026-06-26",
    title: "Source connection and video discovery",
    summary:
      "Operators can now connect to a source Rev environment, confirm the connection, and browse real source videos.",
    highlights: [
      "Connect to Rev using API credentials or username and password",
      "Validate the source environment before continuing",
      "Search and page through the source video library",
    ],
    commitRefs: ["948e701"],
    status: "Live",
  },
  {
    version: "0.3",
    date: "Delivered",
    title: "Saved environments and destination setup",
    summary:
      "Environment setup is now reusable so operators do not need to re-enter platform details for every project.",
    highlights: [
      "Save source and destination environments",
      "Prepare destination connectivity",
      "Support reusable platform setup",
    ],
    commitRefs: ["6206cb1"],
    status: "Live",
  },
  {
    version: "0.7",
    date: "Planned",
    title: "Single-video migration",
    summary:
      "After shared environment setup is in place, the next step is moving a single video and its core metadata end to end.",
    highlights: [
      "Migrate a single selected video",
      "Carry title, description, tags, and categories",
      "Report success and failure clearly to operators",
    ],
    status: "Planned",
  },
];
