"use client";

import Button from "@/components/ui/Button";

export default function Sidebar({ open, onClose, children }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[88%] max-w-sm overflow-y-auto border-r border-line bg-bg transition-transform duration-200 lg:sticky lg:top-14 lg:z-auto lg:h-[calc(100dvh-3.5rem)] lg:w-auto lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4 lg:hidden">
          <span className="text-sm font-medium">Input</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
        <div className="flex flex-col gap-4 p-4 lg:p-6">{children}</div>
      </aside>
    </>
  );
}
