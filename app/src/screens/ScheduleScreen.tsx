/**
 * ScheduleScreen.tsx
 * ------------------
 * Festival schedule with three section tabs:
 *   Music    — grid with stages on X axis
 *   Arts & More — grid with districts on X axis
 *   My Plan  — grid with attended items, columns by stage or district
 *
 * Shared controls:
 *   - Date navigation (only dates with content)
 *   - Grid / List view toggle
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  SectionList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import Screen from "../components/Screen";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ScheduleStatusBanner from "../components/ScheduleStatusBanner";

import { useOfflineStatus } from "../hooks/useOfflineStatus";
import useScheduleData from "../hooks/useScheduleData";
import { ScheduleItem } from "../models/schedule/scheduleTypes";
import { useAppSettings } from "../context/AppSettingsContext";
import { useAttending } from "../context/AttendingContext";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MINUTE_HEIGHT = 1.1;
const TIME_COL_WIDTH = 52;
const COL_WIDTH = 130;
const HEADER_HEIGHT = 44;
const GRID_START_HOUR = 12;
const GRID_END_HOUR = 22;

type SectionTab = "music" | "arts";
type ViewMode = "grid" | "list";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function minutesFromGridStart(isoTime: string): number {
  const d = new Date(isoTime);
  return (d.getHours() - GRID_START_HOUR) * 60 + d.getMinutes();
}

function durationMinutes(startIso: string, endIso: string): number {
  return Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000
  );
}

function formatHour(hour: number): string {
  if (hour === 12) return "12 PM";
  if (hour === 0) return "12 AM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isMusic(item: ScheduleItem): boolean {
  return item.itemType === "musician";
}

function isArts(item: ScheduleItem): boolean {
  return item.itemType === "artist";
}

// ---------------------------------------------------------------------------
// Grid View
// ---------------------------------------------------------------------------

function GridView({
  items,
  columns,
  getColumn,
  emptyMessage,
  onItemPress,
  theme,
  themeColorHex,
}: {
  items: ScheduleItem[];
  columns: string[];
  getColumn: (item: ScheduleItem) => string;
  emptyMessage: string;
  onItemPress: (item: ScheduleItem) => void;
  theme: any;
  themeColorHex: string;
}) {
  const totalMinutes = (GRID_END_HOUR - GRID_START_HOUR) * 60;
  const gridHeight = totalMinutes * MINUTE_HEIGHT;

  const hours = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
    (_, i) => GRID_START_HOUR + i
  );

  const gutterRef = React.useRef<ScrollView>(null);

  const byColumn = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    columns.forEach((c) => (map[c] = []));
    items.forEach((item) => {
      const col = getColumn(item);
      if (map[col]) map[col].push(item);
    });
    return map;
  }, [items, columns, getColumn]);

  if (columns.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <View style={styles.contentSpacing}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Fixed left: time gutter + blank header corner */}
        <View
          style={{
            width: TIME_COL_WIDTH,
            borderRightWidth: 1,
            borderRightColor: theme.colors.border,
          }}
        >
          <View
            style={[
              styles.timeGutterHeader,
              {
                height: HEADER_HEIGHT,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              },
            ]}
          />
          <ScrollView
            ref={gutterRef}
            scrollEnabled={false}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ height: gridHeight, position: "relative" }}>
              {hours.map((hour) => (
                <View
                  key={hour}
                  style={[
                    styles.timeLabel,
                    {
                      top:
                        (hour - GRID_START_HOUR) * 60 * MINUTE_HEIGHT - 8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.timeLabelText,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {formatHour(hour)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Right: horizontally scrollable columns */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          style={{ flex: 1 }}
        >
          <View>
            {/* Column headers */}
            <View
              style={[
                styles.gridHeaderRow,
                {
                  backgroundColor: theme.colors.surface,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              {columns.map((col) => (
                <View
                  key={col}
                  style={[
                    styles.colHeader,
                    { width: COL_WIDTH, borderRightColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[styles.colHeaderText, { color: theme.colors.text }]}
                    numberOfLines={2}
                  >
                    {col}
                  </Text>
                </View>
              ))}
            </View>

            {/* Vertically scrollable columns — synced with gutter */}
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              onScroll={(e) => {
                gutterRef.current?.scrollTo({
                  y: e.nativeEvent.contentOffset.y,
                  animated: false,
                });
              }}
              scrollEventThrottle={16}
            >
              <View style={{ height: gridHeight, flexDirection: "row" }}>
                {columns.map((col) => (
                  <View
                    key={col}
                    style={[
                      styles.gridCol,
                      {
                        width: COL_WIDTH,
                        height: gridHeight,
                        borderLeftColor: theme.colors.border,
                      },
                    ]}
                  >
                    {hours.map((hour) => (
                      <View
                        key={hour}
                        style={[
                          styles.gridLine,
                          {
                            top:
                              (hour - GRID_START_HOUR) *
                              60 *
                              MINUTE_HEIGHT,
                            borderTopColor: theme.colors.border,
                          },
                        ]}
                      />
                    ))}

                    {byColumn[col]?.map((item) => {
                      const startOffset = minutesFromGridStart(item.startTime);
                      const endOffset =
                        minutesFromGridStart(item.startTime) +
                        durationMinutes(item.startTime, item.endTime);

                      // clamp to visible 12 PM–10 PM window
                      const visibleStart = Math.max(0, startOffset);
                      const visibleEnd = Math.min(totalMinutes, endOffset);

                      if (visibleEnd <= 0 || visibleStart >= totalMinutes) {
                        return null;
                      }

                      const top = visibleStart * MINUTE_HEIGHT;
                      const height = Math.max(
                        (visibleEnd - visibleStart) * MINUTE_HEIGHT,
                        32
                      );

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.gridBlock,
                            { top, height, backgroundColor: themeColorHex },
                          ]}
                          onPress={() => onItemPress(item)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.gridBlockTitle} numberOfLines={2}>
                            {decodeHtml(item.title)}
                          </Text>
                          {height > 44 && (
                            <Text style={styles.gridBlockTime}>
                              {formatTime(item.startTime)} –{" "}
                              {formatTime(item.endTime)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// List View
// ---------------------------------------------------------------------------

function ListView({
  items,
  emptyMessage,
  filterOptions,
  categoryFilter,
  onCategoryFilter,
  refreshing,
  onRefresh,
  onItemPress,
  theme,
  themeColorHex,
}: {
  items: ScheduleItem[];
  emptyMessage: string;
  filterOptions: string[];
  categoryFilter: string;
  onCategoryFilter: (val: string) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onItemPress: (item: ScheduleItem) => void;
  theme: any;
  themeColorHex: string;
}) {
  const sections = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    const sorted = [...items].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    sorted.forEach((item) => {
      const label = new Date(item.startTime).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
      const arr = map.get(label) ?? [];
      arr.push(item);
      map.set(label, arr);
    });
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [items]);

  return (
    <View style={[{ flex: 1 }, styles.contentSpacing]}>
      {filterOptions.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, flexShrink: 0 }}
          contentContainerStyle={styles.filterChipRow}
        >
          {filterOptions.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => onCategoryFilter(opt)}
              style={[
                styles.filterChip,
                {
                  borderColor: categoryFilter === opt ? themeColorHex : theme.colors.border,
                  backgroundColor: categoryFilter === opt ? themeColorHex : theme.colors.surface,
                },
              ]}
            >
              <Text style={[styles.filterChipText, { color: categoryFilter === opt ? "#fff" : theme.colors.textMuted }]}>
                {opt === "all" ? "All" : opt}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      {items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <SectionList
          style={{ flex: 1 }}
          sections={sections}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderSectionHeader={({ section }) => (
            <View
              style={[
                styles.listSectionHeader,
                {
                  backgroundColor: theme.colors.surface,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.listSectionTitle, { color: theme.colors.text }]}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.listRow,
                {
                  borderBottomColor: theme.colors.border,
                  backgroundColor: theme.colors.surface2,
                },
              ]}
              onPress={() => onItemPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.listAccent, { backgroundColor: themeColorHex }]} />
              <View style={styles.listRowContent}>
                <Text
                  style={[styles.listRowTitle, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {decodeHtml(item.title)}
                </Text>
                <Text style={[styles.listRowMeta, { color: theme.colors.textMuted }]}>
                  {formatTime(item.startTime)} – {formatTime(item.endTime)}
                  {item.stage ? ` · ${item.stage}` : ""}
                </Text>
                {item.category ? (
                  <Text style={[styles.listRowCategory, { color: theme.colors.textMuted }]}>
                    {item.category}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: 32 }} />}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ScheduleScreen
// ---------------------------------------------------------------------------

export default function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const isOffline = useOfflineStatus();
  const { theme, themeColorHex } = useAppSettings();
  const schedule = useScheduleData(!isOffline);

  // Use shared attending context — updates instantly from any screen
  const { attendingIds } = useAttending();

  const [sectionTab, setSectionTab] = useState<SectionTab>("music");
  const [myPlanActive, setMyPlanActive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Unique days with content
  const festivalDays = useMemo(() => {
    const days = new Set(
      schedule.events.map((e) => new Date(e.startTime).toDateString())
    );
    return Array.from(days).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  }, [schedule.events]);

  useEffect(() => {
    if (festivalDays.length > 0 && selectedDate === null) {
      setSelectedDate(festivalDays[0]);
    }
  }, [festivalDays, selectedDate]);

  const currentDayIndex = festivalDays.indexOf(selectedDate ?? "");
  const canGoPrev = currentDayIndex > 0;
  const canGoNext = currentDayIndex < festivalDays.length - 1;

  const formatDayLabel = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  // Events for selected date
  const dayItems = useMemo(() => {
    if (!selectedDate) return [];
    return schedule.events.filter(
      (e) => new Date(e.startTime).toDateString() === selectedDate
    );
  }, [schedule.events, selectedDate]);

  // Music — stages as columns
  const musicItems = useMemo(() => dayItems.filter(isMusic), [dayItems]);
  const musicStages = useMemo(
    () => Array.from(new Set(musicItems.map((e) => e.stage).filter(Boolean))).sort(),
    [musicItems]
  );

  // Arts — districts as columns
  const artsItems = useMemo(() => dayItems.filter(isArts), [dayItems]);
  const artsCategories = useMemo(
    () => Array.from(new Set(artsItems.map((e) => e.category).filter(Boolean))).sort(),
    [artsItems]
  );

  // My Plan — filter by attendingIds from context, reactive to any screen's changes
  const allDayItems = useMemo(
    () => [...musicItems, ...artsItems],
    [musicItems, artsItems]
  );

  const myPlanItems = useMemo(
    () => allDayItems.filter((e) => attendingIds.has(e.id)),
    [allDayItems, attendingIds]
  );

  const myPlanColumns = useMemo(
    () =>
      Array.from(
        new Set(
          myPlanItems
            .map((e) => (e.itemType === "musician" ? e.stage : e.category))
            .filter(Boolean)
        )
      ).sort(),
    [myPlanItems]
  );

  const handleItemPress = (item: ScheduleItem) => {
    navigation.navigate("Detail", { item: item.rawItem, type: item.itemType });
  };

  // Reset category filter when tab or plan toggle changes
  useEffect(() => {
    setCategoryFilter("all");
  }, [sectionTab, myPlanActive]);

  const baseItems = sectionTab === "music" ? musicItems : artsItems;

  const filterOptions = useMemo(() => {
    const source = myPlanActive ? myPlanItems : baseItems;
    const key = (myPlanActive || sectionTab === "arts")
      ? (e: ScheduleItem) => e.category
      : (e: ScheduleItem) => e.stage;
    const vals = Array.from(new Set(source.map(key).filter(Boolean))).sort();
    return ["all", ...vals];
  }, [myPlanActive, myPlanItems, baseItems, sectionTab]);

  const gridItems = myPlanActive ? myPlanItems : baseItems;

  const listItems = useMemo(() => {
    const source = myPlanActive ? myPlanItems : baseItems;
    if (categoryFilter === "all") return source;
    const useCategory = myPlanActive || sectionTab === "arts";
    return source.filter((e) =>
      useCategory ? e.category === categoryFilter : e.stage === categoryFilter
    );
  }, [myPlanActive, myPlanItems, baseItems, categoryFilter, sectionTab]);

  const currentItems = viewMode === "grid" ? gridItems : listItems;

  const currentColumns = myPlanActive
    ? myPlanColumns
    : sectionTab === "music" ? musicStages : artsCategories;

  const currentGetColumn = (item: ScheduleItem) => {
    if (myPlanActive) {
      return item.itemType === "musician" ? item.stage : item.category;
    }
    return sectionTab === "music" ? item.stage : item.category;
  };

  const currentEmpty =
    myPlanActive
      ? "Nothing in your plan yet. Tap Attend on any event or performance."
      : sectionTab === "music"
      ? "No music scheduled for this day."
      : "No arts events scheduled for this day.";

  if (schedule.isInitialLoading && !schedule.hasCache) {
    return (
      <Screen>
        <LoadingState visible message="Loading schedule..." />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.screenTitle, { color: theme.colors.text, fontSize: theme.typography.h1 }]}>
          Schedule
        </Text>
        <Pressable
          onPress={() => setMyPlanActive((v) => !v)}
          style={[
            styles.myPlanHeaderBtn,
            {
              borderColor: themeColorHex,
              backgroundColor: myPlanActive ? themeColorHex : "transparent",
            },
          ]}
        >
          <Text style={[styles.myPlanHeaderBtnText, { color: myPlanActive ? "#fff" : themeColorHex }]}>
            My Plan
          </Text>
        </Pressable>
      </View>

      {/* Section tabs: hidden when My Plan is active */}
      {!myPlanActive && (
        <View style={[styles.tabRow, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.tabGroup}>
            {(
              [
                { key: "music", label: "Music" },
                { key: "arts", label: "Arts & More" },
              ] as { key: SectionTab; label: string }[]
            ).map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setSectionTab(t.key)}
                style={[
                  styles.tab,
                  sectionTab === t.key && {
                    borderBottomColor: themeColorHex,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: sectionTab === t.key ? themeColorHex : theme.colors.textMuted },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Date nav */}
      {festivalDays.length > 0 && (
        <View style={[styles.dateNav, { borderBottomColor: theme.colors.border }]}>
          <Pressable
            onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            style={[
              styles.viewToggle,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.viewToggleText, { color: theme.colors.text }]}>
              {viewMode === "grid" ? "Grid" : "List"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => canGoPrev && setSelectedDate(festivalDays[currentDayIndex - 1])}
            style={[styles.dateArrow, { opacity: canGoPrev ? 1 : 0.3 }]}
          >
            <Text style={[styles.dateArrowText, { color: theme.colors.text }]}>‹</Text>
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datePills}
          >
            {festivalDays.map((day) => (
              <Pressable
                key={day}
                onPress={() => setSelectedDate(day)}
                style={[
                  styles.datePill,
                  {
                    borderColor: selectedDate === day ? themeColorHex : theme.colors.border,
                    backgroundColor: selectedDate === day ? themeColorHex : theme.colors.surface,
                  },
                ]}
              >
                <Text style={[styles.datePillText, { color: selectedDate === day ? "#fff" : theme.colors.text }]}>
                  {formatDayLabel(day)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={() => canGoNext && setSelectedDate(festivalDays[currentDayIndex + 1])}
            style={[styles.dateArrow, { opacity: canGoNext ? 1 : 0.3 }]}
          >
            <Text style={[styles.dateArrowText, { color: theme.colors.text }]}>›</Text>
          </Pressable>
        </View>
      )}

      <ScheduleStatusBanner
        isOnline={!isOffline}
        isStale={schedule.isStale}
        lastUpdatedText={schedule.lastUpdatedText}
        refreshError={schedule.refreshError}
        onRefresh={schedule.refresh}
      />

      {/* Content */}
      {viewMode === "grid" ? (
        <GridView
          items={currentItems}
          columns={currentColumns}
          getColumn={currentGetColumn}
          emptyMessage={currentEmpty}
          onItemPress={handleItemPress}
          theme={theme}
          themeColorHex={themeColorHex}
        />
      ) : (
        <ListView
          items={currentItems}
          emptyMessage={currentEmpty}
          filterOptions={filterOptions}
          categoryFilter={categoryFilter}
          onCategoryFilter={setCategoryFilter}
          refreshing={schedule.isRefreshing}
          onRefresh={schedule.refresh}
          onItemPress={handleItemPress}
          theme={theme}
          themeColorHex={themeColorHex}
        />
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 8,
  },
  screenTitle: {
    fontWeight: "800",
  },
  contentSpacing: {
    flex: 1,
    paddingTop: 10,
  },
  viewToggle: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
    marginRight: 4,
  },
  viewToggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
  },
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dateArrow: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dateArrowText: {
    fontSize: 24,
    fontWeight: "300",
  },
  datePills: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  datePill: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  datePillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  gridHeaderRow: {
    flexDirection: "row",
    height: HEADER_HEIGHT,
    borderBottomWidth: 1,
  },
  timeGutterHeader: {
    borderRightWidth: 1,
  },
  colHeader: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    paddingHorizontal: 6,
  },
  colHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  timeGutter: {
    position: "relative",
  },
  timeLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingLeft: 6,
  },
  timeLabelText: {
    fontSize: 10,
    fontWeight: "600",
  },
  gridCol: {
    position: "relative",
    borderLeftWidth: 1,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  gridBlock: {
    position: "absolute",
    left: 3,
    right: 3,
    borderRadius: 6,
    padding: 5,
    overflow: "hidden",
  },
  gridBlockTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  gridBlockTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  listSectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  listSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  listAccent: {
    width: 4,
  },
  listRowContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  listRowTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },
  listRowMeta: {
    fontSize: 12,
    marginBottom: 2,
  },
  listRowCategory: {
    fontSize: 11,
  },
  filterChipRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    flexGrow: 0,
  },
  filterChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tabGroup: {
    flexDirection: "row",
    flex: 1,
  },
  myPlanHeaderBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  myPlanHeaderBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  viewToggleInNav: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 4,
  },
});