"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TabBar from "./TabBar";

export default function Shell({ sidebar, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <Header onOpenInputs={() => setOpen(true)} />
      <div className="md:grid md:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar open={open} onClose={() => setOpen(false)}>
          {sidebar}
        </Sidebar>
        <main className="min-w-0 px-4 pb-24 pt-4 md:px-8 md:pb-10 md:pt-6">
          <div className="mx-auto max-w-6xl">
            <TabBar />
            <div className="mt-4 flex flex-col gap-4">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
