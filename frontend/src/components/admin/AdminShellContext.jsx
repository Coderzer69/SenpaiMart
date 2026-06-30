import { createContext, useContext, useMemo, useState } from "react";

const AdminShellContext = createContext(null);

export function AdminShellProvider({ children, activeSection, onSectionChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 6);
    return { from, to };
  });

  const value = useMemo(
    () => ({
      activeSection,
      onSectionChange,
      searchQuery,
      setSearchQuery,
      dateRange,
      setDateRange,
    }),
    [activeSection, onSectionChange, searchQuery, dateRange],
  );

  return (
    <AdminShellContext.Provider value={value}>
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  const ctx = useContext(AdminShellContext);
  if (!ctx) {
    throw new Error("useAdminShell must be used within AdminShellProvider");
  }
  return ctx;
}
