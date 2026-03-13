import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getAttending,
  toggleAttending,
  AttendingRecord,
} from "../storage/attendingStore";

type AttendingContextType = {
  attendingIds: Set<string>;
  isAttending: (id: string) => boolean;
  toggle: (input: {
    id: string;
    title?: string;
    start?: string;
    end?: string;
    stage?: string;
  }) => Promise<boolean>;
  reload: () => Promise<void>;
};

const AttendingContext = createContext<AttendingContextType>({
  attendingIds: new Set(),
  isAttending: () => false,
  toggle: async () => false,
  reload: async () => {},
});

export function AttendingProvider({ children }: { children: React.ReactNode }) {
  const [attendingIds, setAttendingIds] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    const records = await getAttending();
    setAttendingIds(new Set(records.map((r) => r.id)));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggle = useCallback(async (input: {
    id: string;
    title?: string;
    start?: string;
    end?: string;
    stage?: string;
  }): Promise<boolean> => {
    const { isNowAttending } = await toggleAttending(input);
    await reload();
    return isNowAttending;
  }, [reload]);

  const isAttendingFn = useCallback(
    (id: string) => attendingIds.has(id),
    [attendingIds]
  );

  return (
    <AttendingContext.Provider value={{ attendingIds, isAttending: isAttendingFn, toggle, reload }}>
      {children}
    </AttendingContext.Provider>
  );
}

export function useAttending() {
  return useContext(AttendingContext);
}