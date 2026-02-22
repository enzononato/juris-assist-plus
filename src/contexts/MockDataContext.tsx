import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface MockDataContextValue {
  revision: number;
  notifyChange: () => void;
}

const MockDataContext = createContext<MockDataContextValue | undefined>(undefined);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);
  const notifyChange = useCallback(() => setRevision((r) => r + 1), []);

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
