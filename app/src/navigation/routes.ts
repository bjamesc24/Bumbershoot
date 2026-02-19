export const Routes = {
  Tabs: {
    ScheduleTab: "ScheduleTab",
    FavoritesTab: "FavoritesTab",
    MapTab: "MapTab",
    AnnouncementsTab: "AnnouncementsTab",
  },
  ScheduleStack: {
    Schedule: "Schedule",
    EventDetails: "EventDetails",
  },
} as const;

export type TabRouteName = (typeof Routes.Tabs)[keyof typeof Routes.Tabs];
export type ScheduleStackRouteName =
  (typeof Routes.ScheduleStack)[keyof typeof Routes.ScheduleStack];
