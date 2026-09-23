import { useCallback, useEffect, useState } from "react";

const SCROLL_STEP = 3;

export interface UseScrollStateReturn {
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  scrollUp: () => void;
  scrollDown: () => void;
  atBottom: boolean;
}

export function useScrollState(totalItems: number): UseScrollStateReturn {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex((prev) => {
      const lastIndex = Math.max(0, totalItems - 1);
      const wasAtBottom = prev >= totalItems - 2;
      return wasAtBottom ? lastIndex : prev;
    });
  }, [totalItems]);

  const scrollUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - SCROLL_STEP));
  }, []);

  const scrollDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(Math.max(0, totalItems - 1), prev + SCROLL_STEP));
  }, [totalItems]);

  const atBottom = selectedIndex >= Math.max(0, totalItems - 1);

  return {
    selectedIndex,
    setSelectedIndex,
    scrollUp,
    scrollDown,
    atBottom,
  };
}
