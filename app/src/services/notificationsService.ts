/**
 * notificationsService.ts
 * -----------------------
 * Responsibility:
 *   Schedule and cancel local push notifications for attended events.
 *
 * Design considerations:
 *   - Permissions are requested once on first use.
 *   - Two notifications are scheduled per attended event:
 *       1. At event start time
 *       2. 15 minutes before event start time
 *   - Notification IDs are derived from the event id so they can be cancelled later.
 *   - FR-07.3 (rescheduled event notifications) is stubbed for future implementation.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

/**
 * Requests notification permissions from the user.
 * Returns true if granted, false otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return status === "granted";
}

// ---------------------------------------------------------------------------
// Notification ID helpers
// ---------------------------------------------------------------------------

/** ID for the at-start-time notification */
const startNotifId = (eventId: string) => `event-start-${eventId}`;

/** ID for the 15-minutes-before notification */
const reminderNotifId = (eventId: string) => `event-reminder-${eventId}`;

// ---------------------------------------------------------------------------
// Schedule reminders
// ---------------------------------------------------------------------------

/**
 * Schedules two notifications for an attended event:
 *   - At event start time
 *   - 15 minutes before event start time
 *
 * Silently skips if permissions are not granted or if the event time is in the past.
 */
export async function scheduleEventReminders(input: {
  eventId: string;
  title: string;
  startTime: string; // ISO 8601
  stage?: string;
}): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const startMs = new Date(input.startTime).getTime();
  const now = Date.now();
  const reminderMs = startMs - 15 * 60 * 1000; // 15 minutes before

  // Cancel any existing notifications for this event before rescheduling
  await cancelEventReminders(input.eventId);

  // Schedule at-start-time notification
  if (startMs > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: startNotifId(input.eventId),
      content: {
        title: input.title,
        body: input.stage
          ? `Starting now at ${input.stage}`
          : "Starting now",
        data: { eventId: input.eventId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(startMs),
      },
    });
  }

  // Schedule 15-minutes-before notification
  if (reminderMs > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: reminderNotifId(input.eventId),
      content: {
        title: input.title,
        body: input.stage
          ? `Starting in 15 minutes at ${input.stage}`
          : "Starting in 15 minutes",
        data: { eventId: input.eventId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(reminderMs),
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Cancel reminders
// ---------------------------------------------------------------------------

/**
 * Cancels both scheduled notifications for an event.
 * Called when user unattends an event.
 */
export async function cancelEventReminders(eventId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(startNotifId(eventId));
  await Notifications.cancelScheduledNotificationAsync(reminderNotifId(eventId));
}

// ---------------------------------------------------------------------------
// FR-07.3 — Rescheduled event notifications (stubbed)
// ---------------------------------------------------------------------------

/**
 * TODO: FR-07.3
 * When the API is live, compare cached event start times against fresh data.
 * If a favorited event's start time has changed, cancel old reminders,
 * schedule new ones, and send an immediate notification alerting the user.
 *
 * Called from the data refresh cycle in useScheduleData.
 */
export async function notifyRescheduledEvents(
  _previousEvents: any[],
  _freshEvents: any[]
): Promise<void> {
  // Stub — implement when API is live
}