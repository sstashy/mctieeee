import { useEffect, useRef, useState, useCallback } from "react";
import { getSiteStatus } from "../services/api";

/**
 * Fazlar: loading | success
 * Basit, StrictMode güvenli, fetch yarışlarını id bazlı filtreliyor.
 */
export default function useSiteStatus({
  failOpenAfterMs = 1200,
  refreshInterval = 0,
  debug = true
} = {}) {
  const [phase, setPhase] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Refs
  const abortRef = useRef(null);
  const timersRef = useRef({ failOpen: null, poll: null });
  const runningRef = useRef(false);
  const fetchIdRef = useRef(0); // artan kimlik
  const latestAppliedIdRef = useRef(-1);

  const log = (...a) => debug && console.log("[useSiteStatus]", ...a);

  const clearTimer = (k) => {
    if (timersRef.current[k]) {
      clearTimeout(timersRef.current[k]);
      timersRef.current[k] = null;
    }
  };
  const clearAllTimers = () => {
    Object.keys(timersRef.current).forEach(clearTimer);
  };

  const applySuccess = (id, payload, source) => {
    if (id < latestAppliedIdRef.current) {
      log("skip stale success (id)", id, "latest", latestAppliedIdRef.current, source);
      return;
    }
    latestAppliedIdRef.current = id;
    setData(payload);
    setError(null);
    setPhase("success");
    log("success applied id", id, source, payload);
  };

  const fetchOnce = useCallback(async () => {
    if (runningRef.current) {
      log("fetch skipped (running)");
      return;
    }
    runningRef.current = true;

    const fetchId = ++fetchIdRef.current;
    log("FETCH start id=", fetchId);
    setPhase(p => (p === "success" ? "success" : "loading"));
    setError(null);

    // Abort önceki
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      const res = await getSiteStatus({ signal });

      log("FETCH result id=", fetchId, res);
      if (signal.aborted) {
        log("FETCH aborted after settle id=", fetchId);
        return;
      }

      if (res.ok && res.data) {
        clearTimer("failOpen");
        applySuccess(fetchId, res.data, "network");
      } else {
        log("FETCH not ok id=", fetchId);
        if (!data) {
          // fail-open bekle
          setError("status-failed");
        } else {
          applySuccess(fetchId, data, "retain-cache");
        }
      }
    } catch (e) {
      if (signal.aborted) {
        log("FETCH AbortError id=", fetchId);
      } else {
        log("FETCH exception id=", fetchId, e);
        if (!data) setError("exception");
      }
    } finally {
      if (runningRef.current) runningRef.current = false;
      log("FETCH finally id=", fetchId);
    }
  }, [data]);

  // İlk mount + fail-open + opsiyonel polling
  useEffect(() => {
    log("MOUNT (StrictMode safe)");
    runningRef.current = false; // ikinci mount reset
    fetchOnce();

    if (failOpenAfterMs > 0) {
      clearTimer("failOpen");
      const scheduledId = fetchIdRef.current;
      timersRef.current.failOpen = setTimeout(() => {
        log("FAIL-OPEN timer fire scheduledId=", scheduledId, "latestApplied=", latestAppliedIdRef.current, "phase=", phase, "data=", data);
        // Henüz success uygulanmadıysa ve hiçbir fetch success'e ulaşmadıysa fail-open uygula
        if (latestAppliedIdRef.current < scheduledId && phase !== "success" && !data) {
            applySuccess(scheduledId, { active: true, message: "assumed-up" }, "fail-open");
        } else {
          log("FAIL-OPEN skip (already resolved or newer fetch)");
        }
      }, failOpenAfterMs);
    }

    if (refreshInterval > 0) {
      clearTimer("poll");
      timersRef.current.poll = setInterval(() => {
        log("POLL tick");
        fetchOnce();
      }, refreshInterval);
    }

    return () => {
      log("UNMOUNT cleanup");
      abortRef.current?.abort();
      runningRef.current = false;
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnce, failOpenAfterMs, refreshInterval]);

  useEffect(() => {
    log("STATE", { phase, data, error });
  }, [phase, data, error]);

  return {
    data,
    phase,
    error,
    reload: fetchOnce,
    isLoading: phase === "loading",
    isRefreshing: false,
    isError: false,
    isSuccess: phase === "success"
  };
}