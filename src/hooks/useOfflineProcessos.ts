import { useState, useEffect, useCallback } from "react";
import { mockCases, type Case } from "@/data/mock";

const OFFLINE_KEY = "siag_offline_processos";
const SYNC_KEY = "siag_offline_sync_at";

interface OfflineState {
  isOnline: boolean;
  isOfflineMode: boolean;
  cachedCases: Case[];
  lastSyncAt: string | null;
  syncNow: () => void;
  caseCount: number;
}

export function useOfflineProcessos(): OfflineState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(() => localStorage.getItem(SYNC_KEY));

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && mockCases.length > 0) {
      syncToStorage();
    }
  }, [isOnline]);

  function syncToStorage() {
    try {
      const slim = mockCases.map((c) => ({
        id: c.id, case_number: c.case_number, employee: c.employee,
        status: c.status, theme: c.theme, court: c.court, branch: c.branch,
        amount: c.amount, filed_at: c.filed_at, next_deadline: c.next_deadline,
        next_hearing: c.next_hearing, company_id: c.company_id,
      }));
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(slim));
      const now = new Date().toISOString();
      localStorage.setItem(SYNC_KEY, now);
      setLastSyncAt(now);
    } catch {
      // quota exceeded
    }
  }

  const getCachedCases = useCallback((): Case[] => {
    if (isOnline) return mockCases;
    try {
      const raw = localStorage.getItem(OFFLINE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [isOnline]);

  const cachedCases = getCachedCases();

  return {
    isOnline,
    isOfflineMode: !isOnline,
    cachedCases,
    lastSyncAt,
    syncNow: syncToStorage,
    caseCount: cachedCases.length,
  };
}
