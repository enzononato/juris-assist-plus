import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  mockCases, mockTasks, mockHearings, mockDeadlines, mockAlerts,
  mockTimelineEvents, mockEvidenceRequests, mockEvidenceItems, mockCaseChecklists,
  type Case, type Task, type Hearing, type Deadline, type Alert, type TimelineEvent,
  type EvidenceRequest, type EvidenceItem, type CaseChecklist,
} from "@/data/mock";

const STORAGE_KEY = "siag_mock_data";

interface StoredData {
  cases: Case[];
  tasks: Task[];
  hearings: Hearing[];
  deadlines: Deadline[];
  alerts: Alert[];
  timelineEvents: TimelineEvent[];
  evidenceRequests: EvidenceRequest[];
  evidenceItems: EvidenceItem[];
  caseChecklists: CaseChecklist[];
}

function loadFromStorage(): StoredData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredData;
  } catch {
    return null;
  }
}

function saveToStorage() {
  try {
    const data: StoredData = {
      cases: [...mockCases],
      tasks: [...mockTasks],
      hearings: [...mockHearings],
      deadlines: [...mockDeadlines],
      alerts: [...mockAlerts],
      timelineEvents: [...mockTimelineEvents],
      evidenceRequests: [...mockEvidenceRequests],
      evidenceItems: [...mockEvidenceItems],
      caseChecklists: [...mockCaseChecklists],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded — silently fail
  }
}

function hydrateArrays(data: StoredData) {
  // Replace contents of exported mock arrays in-place
  mockCases.length = 0;
  mockCases.push(...data.cases);

  mockTasks.length = 0;
  mockTasks.push(...data.tasks);

  mockHearings.length = 0;
  mockHearings.push(...data.hearings);

  mockDeadlines.length = 0;
  mockDeadlines.push(...data.deadlines);

  mockAlerts.length = 0;
  mockAlerts.push(...data.alerts);

  mockTimelineEvents.length = 0;
  mockTimelineEvents.push(...data.timelineEvents);

  mockEvidenceRequests.length = 0;
  mockEvidenceRequests.push(...data.evidenceRequests);

  mockEvidenceItems.length = 0;
  mockEvidenceItems.push(...data.evidenceItems);

  mockCaseChecklists.length = 0;
  mockCaseChecklists.push(...data.caseChecklists);
}

interface MockDataContextValue {
  revision: number;
  notifyChange: () => void;
}

const MockDataContext = createContext<MockDataContextValue | undefined>(undefined);

let _initialized = false;

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    if (_initialized) return;
    _initialized = true;
    const stored = loadFromStorage();
    if (stored) {
      hydrateArrays(stored);
      setRevision((r) => r + 1);
    }
  }, []);

  const notifyChange = useCallback(() => {
    setRevision((r) => r + 1);
    saveToStorage();
  }, []);

  return (
    <MockDataContext.Provider value={{ revision, notifyChange }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error("useMockData must be used within MockDataProvider");
  return ctx;
}
