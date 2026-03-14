import { apiClient } from "./apiClient";

export type ScheduleResponse = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  stage: string;
  category: string;
  tags: string[];
  description: string;
  sourceType: "music" | "art";
  rawItem?: any;
}[];

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

function loadSampleMusic(): any[] {
  const data = require("../sample-data/music.sample.json");
  return Array.isArray(data) ? data : [];
}

function loadSampleArt(): any[] {
  const data = require("../sample-data/art.sample.json");
  return Array.isArray(data) ? data : [];
}

function mapMusicItem(item: any) {
  return {
    id: `music-${item.id}`,
    title: item?.title?.rendered ?? "Untitled Music Event",
    startTime: item?.meta?.event_start_time ?? "",
    endTime: item?.meta?.event_end_time ?? "",
    stage: item?.meta?.stage ?? "Unknown Stage",
    category: item?.meta?.event_category ?? item?.meta?.genre ?? "Music",
    tags: [item?.meta?.event_category, item?.meta?.genre].filter(Boolean),
    description:
      stripHtml(item?.excerpt?.rendered) ||
      stripHtml(item?.content?.rendered) ||
      "",
    sourceType: "music" as const,
    rawItem: item,
  };
}

function mapArtItem(item: any) {
  return {
    id: `art-${item.id}`,
    title: item?.title?.rendered ?? "Untitled Art Event",
    startTime: item?.meta?.event_start_time ?? "",
    endTime: item?.meta?.event_end_time ?? "",
    stage: item?.meta?.district ?? "Unknown District",
    category: item?.meta?.event_category ?? item?.meta?.genre ?? "Art",
    tags: [item?.meta?.event_category, item?.meta?.genre].filter(Boolean),
    description:
      stripHtml(item?.excerpt?.rendered) ||
      stripHtml(item?.content?.rendered) ||
      "",
    sourceType: "art" as const,
    rawItem: item,
  };
}

function loadSampleSchedule(): ScheduleResponse {
  const music = loadSampleMusic().map(mapMusicItem);
  const art = loadSampleArt().map(mapArtItem);

  return [...music, ...art].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

async function getScheduleFromApi(): Promise<ScheduleResponse> {
  const [music, art] = await Promise.all([
    apiClient.get<any[]>("/bumbershoot/v1/music"),
    apiClient.get<any[]>("/bumbershoot/v1/art"),
  ]);

  const mappedMusic = (Array.isArray(music) ? music : []).map(mapMusicItem);
  const mappedArt = (Array.isArray(art) ? art : []).map(mapArtItem);

  return [...mappedMusic, ...mappedArt].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export async function getSchedule(): Promise<ScheduleResponse> {
  if (apiClient.useSampleData) {
    return loadSampleSchedule();
  }

  return getScheduleFromApi();
}