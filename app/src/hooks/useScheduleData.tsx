import { useCallback, useEffect, useMemo, useState } from "react";
import { loadScheduleCache, saveScheduleCache } from "../storage/scheduleStorage";;
import { isStale as isStaleFn } from "../utils/stalePolicy";
import { ScheduleEvent } from "../storage/scheduleTypes";

type State = {
  events: ScheduleEvent[];
  lastUpdatedMs: number | null;

  hasCache: boolean;
  isInitialLoading: boolean; // Loading state
  isRefreshing: boolean;

  isStale: boolean;          // Stale data state
  refreshError: string | null;
};

export default function useScheduleData(isOnline: boolean) {
  const [state, setState] = useState<State>({
    events: [],
    lastUpdatedMs: null,
    hasCache: false,
    isInitialLoading: true,
    isRefreshing: false,
    isStale: true,
    refreshError: null,
    });

  
useEffect(() => {
    (async () => {
      const cached = await loadScheduleCache();
      setState((s) => ({
        ...s,
        events: cached.events,
        lastUpdatedMs: cached.lastUpdatedMs,
        hasCache: cached.events.length > 0,
        isInitialLoading: false,
        isStale: isStaleFn(cached.lastUpdatedMs),
      }));
    })();
  }, []);

  const refresh = useCallback(async () => {
    
    if (!isOnline) {
      setState((s) => ({
        ...s,
        refreshError: "Offline — showing saved schedule.",
        isStale: true,
      }));
      return;
    }

    setState((s) => ({ ...s, isRefreshing: true, refreshError: null }));

    try {
      
      const now = Date.now();
     

      setState((s) => ({
        ...s,

        isRefreshing: false,
        isStale: false,
        refreshError: null,
      }));
    } catch (e: any) {
     
      setState((s) => ({
        ...s,
        isRefreshing: false,
        isStale: true,
        refreshError: e?.message ?? "Refresh failed — showing saved schedule.",
      }));
    }
  }, [isOnline]);

 
  useEffect(() => {
    if (isOnline && state.hasCache && state.isStale) refresh();
  }, [isOnline, state.hasCache, state.isStale, refresh]);

  const lastUpdatedText = useMemo(() => {
    if (!state.lastUpdatedMs) return "Never";
    return new Date(state.lastUpdatedMs).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }, [state.lastUpdatedMs]);

  return { ...state, refresh, lastUpdatedText };
}