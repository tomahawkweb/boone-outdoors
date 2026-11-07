"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export type BagLine = { slug: string; quantity: number; color?: string; size?: string };

export function bagLineKey(line: Pick<BagLine, "slug" | "color" | "size">) {
  return [line.slug, line.color ?? "", line.size ?? ""].join(":");
}

type BagContextValue = {
  lines: BagLine[];
  count: number;
  add: (slug: string, quantity?: number, options?: { color?: string; size?: string }) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
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

  const add = useCallback((slug: string, quantity = 1, options?: { color?: string; size?: string }) => {
    const current = readLines();
    const nextLine: BagLine = { slug, quantity, color: options?.color, size: options?.size };
    const key = bagLineKey(nextLine);
    const existing = current.find((line) => bagLineKey(line) === key);
    const next = existing
      ? current.map((line) => (bagLineKey(line) === key ? { ...line, quantity: line.quantity + quantity } : line))
      : [...current, nextLine];
    writeLines(next);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    const current = readLines();
    writeLines(
      quantity < 1
        ? current.filter((line) => bagLineKey(line) !== key)
        : current.map((line) => (bagLineKey(line) === key ? { ...line, quantity } : line)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    writeLines(readLines().filter((line) => bagLineKey(line) !== key));
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
