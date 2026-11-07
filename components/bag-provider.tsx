"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export type BagLine = { slug: string; quantity: number };

type BagContextValue = {
  lines: BagLine[];
  count: number;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const BagContext = createContext<BagContextValue | null>(null);
const storageKey = "dbo-bag";
const changeEvent = "dbo-bag-change";

const emptyLines: BagLine[] = [];
let cachedRaw = "";
let cachedLines: BagLine[] = emptyLines;

function readLines(): BagLine[] {
  const raw = localStorage.getItem(storageKey) ?? "";
  if (raw === cachedRaw) return cachedLines;
  cachedRaw = raw;
  try {
    const parsed = JSON.parse(raw) as BagLine[];
    cachedLines = Array.isArray(parsed) ? parsed.filter((line) => line.slug && line.quantity > 0) : emptyLines;
  } catch {
    cachedLines = emptyLines;
  }
  return cachedLines;
}

function writeLines(lines: BagLine[]) {
  localStorage.setItem(storageKey, JSON.stringify(lines));
  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(changeEvent, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(changeEvent, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function BagProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, readLines, () => emptyLines);

  const add = useCallback((slug: string, quantity = 1) => {
    const current = readLines();
    const existing = current.find((line) => line.slug === slug);
    const next = existing
      ? current.map((line) => (line.slug === slug ? { ...line, quantity: line.quantity + quantity } : line))
      : [...current, { slug, quantity }];
    writeLines(next);
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    const current = readLines();
    writeLines(
      quantity < 1
        ? current.filter((line) => line.slug !== slug)
        : current.map((line) => (line.slug === slug ? { ...line, quantity } : line)),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    writeLines(readLines().filter((line) => line.slug !== slug));
  }, []);

  const clear = useCallback(() => writeLines([]), []);

  const value = useMemo<BagContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, add, setQuantity, remove, clear],
  );

  return <BagContext value={value}>{children}</BagContext>;
}

export function useBag() {
  const value = useContext(BagContext);
  if (!value) throw new Error("useBag must be used within BagProvider");
  return value;
}
