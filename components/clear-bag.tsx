"use client";

import { useEffect } from "react";
import { useBag } from "@/components/bag-provider";

export function ClearBag() {
  const { clear } = useBag();

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
