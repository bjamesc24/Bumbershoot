// app/src/components/AutoRefreshController.tsx
//
// Purpose:
// - Mounts once at app start
// - Runs a change check on boot
// - Logs state changes so we can verify the hook is working

import { useEffect } from "react";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

export default function AutoRefreshController() {
  const { runChangeCheck, needsRefresh, isStale } = useAutoRefresh();

  // Run a change check once on app start
  useEffect(() => {
    console.log("[AutoRefreshController] mounted -> running initial change check");
    runChangeCheck();
  }, [runChangeCheck]);

  // Log whenever these flags change
  useEffect(() => {
    console.log(`[AutoRefreshController] needsRefresh=${needsRefresh} isStale=${isStale}`);
  }, [needsRefresh, isStale]);

  // No UI, just behavior
  return null;
}