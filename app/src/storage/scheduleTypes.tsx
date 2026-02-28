export type ScheduleViewMode = "time" | "stage" | "category";

export type ScheduleEvent = {
  id: string;
  title: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  stage: string;
  category: string;
  tags?: string[];
  description?: string;
};

export type ScheduleSection = {
  title: string;
  data: ScheduleEvent[];
};