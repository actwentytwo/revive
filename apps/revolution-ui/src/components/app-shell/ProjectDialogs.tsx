import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { MigrationProject, ProjectType } from "@revolution/shared";

type ProjectDialogsProps = {
  projects: MigrationProject[];
  create: {
    isOpen: boolean;
    name: string;
    generatedSlug: string;
    summary: string;
    projectType: ProjectType;
    isPending: boolean;
    onClose: () => void;
    onNameChange: (value: string) => void;
    onSummaryChange: (value: string) => void;
    onProjectTypeChange: (value: ProjectType) => void;
    onSubmit: () => void;
  };
  edit: {
    isOpen: boolean;
    projectId: string;
    name: string;
    slug: string;
    summary: string;
    error: string | null;
    isPending: boolean;
    onClose: () => void;
    onNameChange: (value: string) => void;
    onSlugChange: (value: string) => void;
    onSummaryChange: (value: string) => void;
    onSubmit: () => void;
  };
  remove: {
    isOpen: boolean;
    projectId: string;
    isPending: boolean;
    onClose: () => void;
    onSubmit: () => void;
  };
};

export function ProjectDialogs({ projects, create, edit, remove }: ProjectDialogsProps) {
  const editingProject = projects.find((project) => project.id === edit.projectId);
  const isEditUnchanged =
    editingProject &&
    edit.name.trim() === editingProject.name.trim() &&
    edit.slug.trim() === editingProject.slug.trim() &&
    edit.summary.trim() === editingProject.summary.trim();
  const deletingProject = projects.find((project) => project.id === remove.projectId);

  return (
    <>
      <Dialog open={create.isOpen} onClose={create.onClose} fullWidth maxWidth="sm">
        <DialogTitle>Create a New Project</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              label="Project name"
              placeholder="New Pre-Prod Rollout"
              value={create.name}
              onChange={(event) => create.onNameChange(event.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Project slug"
              helperText="Generated automatically from the project name."
              value={create.generatedSlug}
              disabled
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="project-type-label">Project type</InputLabel>
              <Select
                labelId="project-type-label"
                value={create.projectType}
                label="Project type"
                onChange={(event) => create.onProjectTypeChange(event.target.value as ProjectType)}
              >
                <MenuItem value="migration">Migration</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Summary"
              placeholder="Describe what this project is for."
              value={create.summary}
              onChange={(event) => create.onSummaryChange(event.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={create.onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={create.onSubmit}
            disabled={!create.name.trim() || create.isPending}
          >
            Create project
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={edit.isOpen} onClose={edit.onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            {edit.error ? <Alert severity="error">{edit.error}</Alert> : null}
            <TextField
              label="Project name"
              value={edit.name}
              onChange={(event) => edit.onNameChange(event.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Project slug"
              helperText="Used in the project URL."
              value={edit.slug}
              onChange={(event) => edit.onSlugChange(event.target.value)}
              fullWidth
            />
            <TextField
              label="Summary"
              value={edit.summary}
              onChange={(event) => edit.onSummaryChange(event.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={edit.onClose}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              edit.isPending ||
              !edit.name.trim() ||
              !edit.summary.trim() ||
              !editingProject ||
              Boolean(isEditUnchanged)
            }
            onClick={edit.onSubmit}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={remove.isOpen} onClose={remove.onClose} fullWidth maxWidth="sm">
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Typography>
              Are you sure you want to delete{" "}
              <strong>{deletingProject?.name ?? "this project"}</strong>?
            </Typography>
            <Alert severity="warning">
              This will permanently remove the project and its configuration links. This cannot be
              undone.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={remove.onClose}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={remove.onSubmit}
            disabled={remove.isPending || !remove.projectId}
          >
            Delete project
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
