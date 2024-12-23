export interface TimeEntry {
  id: string;
  project_id: string;
  description: string;
  start_time: string;
  end_time: string | null;
  projects?: {
    title: string;
  };
}