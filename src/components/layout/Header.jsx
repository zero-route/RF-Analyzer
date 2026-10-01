"use client";

import Button from "@/components/ui/Button";
import ThemeToggle from "./ThemeToggle";

export default function Header({ onOpenInputs }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg px-4 md:px-8">
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold tracking-tight">EIRP Calculator</span>
        <span className="hidden text-sm text-faint sm:inline">Link budget dan pola antena</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" onClick={onOpenInputs} className="md:hidden">
          Input
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
