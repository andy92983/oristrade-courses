"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./footer";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  // Default: collapsed (icon-only). Persists across sessions via localStorage.
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ot-sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  function toggle() {
    setCollapsed((c) => {
      localStorage.setItem("ot-sidebar-collapsed", (!c).toString());
      return !c;
    });
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      {/* pt-14 clears the mobile top bar; md:ml transitions with sidebar */}
      <div
        className={`flex flex-col flex-1 pt-14 md:pt-0 min-w-0 transition-[margin] duration-200 ${
          collapsed ? "md:ml-14" : "md:ml-60"
        }`}
      >
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
