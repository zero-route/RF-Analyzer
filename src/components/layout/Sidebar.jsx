"use client";

import Button from "@/components/ui/Button";

export default function Sidebar({ open, onClose, collapsed, children }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[88%] max-w-sm overflow-y-auto border-r border-line bg-bg transition-transform duration-200 md:sticky md:top-14 md:z-auto md:h-[calc(100dvh-3.5rem)] md:w-auto md:max-w-none md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:hidden" : ""}`}
      >
        <div className="flex h-14 items-center justify-between px-4 md:hidden">
          <span className="text-sm font-medium">Input</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
        <div className="flex flex-col gap-4 p-4 md:p-5">{children}</div>
      </aside>
    </>
  );
}
