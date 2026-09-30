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
      <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)]">
        <Sidebar open={open} onClose={() => setOpen(false)}>
          {sidebar}
        </Sidebar>
        <main className="min-w-0 px-4 pb-24 pt-4 lg:px-8 lg:pb-10 lg:pt-6">
          <div className="mx-auto max-w-5xl">
            <TabBar />
            <div className="mt-4 flex flex-col gap-4">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
