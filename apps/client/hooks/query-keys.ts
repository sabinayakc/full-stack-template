// Shared query keys — extracted to break circular imports between hook files.

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  board: () => [...projectKeys.all, "board"] as const,
  detail: (id: string) => [...projectKeys.all, id] as const,
  tasks: (projectId: string) => [...projectKeys.all, projectId, "tasks"] as const,
  notes: (projectId: string) => [...projectKeys.all, projectId, "notes"] as const,
  expenses: (projectId: string) => [...projectKeys.all, projectId, "expenses"] as const,
  timeEntries: (projectId: string) => [...projectKeys.all, projectId, "time-entries"] as const,
};

export const scheduleKeys = {
  all: ["schedule"] as const,
  entries: (filters?: Record<string, string | undefined>) =>
    [...scheduleKeys.all, "entries", filters] as const,
  entryDetail: (id: string) => [...scheduleKeys.all, "entries", id] as const,
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (filters?: { from?: string; to?: string }) =>
    [...dashboardKeys.all, "summary", filters] as const,
};

export const userTaskKeys = {
  all: ["user-tasks"] as const,
  list: (filters?: Record<string, string | undefined>) =>
    [...userTaskKeys.all, "list", filters] as const,
  count: () => [...userTaskKeys.all, "count"] as const,
};

export const customerKeys = {
  all: ["customers"] as const,
  list: () => [...customerKeys.all, "list"] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
  search: (q: string) => [...customerKeys.all, "search", q] as const,
};
