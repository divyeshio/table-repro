import { useVirtualizer } from "@tanstack/react-virtual";
import { type RefObject, useEffect, useRef } from "react";

interface UseVirtualInfiniteScrollOptions {
  rowCount: number;
  overscan?: number;
  estimatedRowHeight?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  prefetchThreshold?: number;
}

interface UseVirtualInfiniteScrollResult {
  parentRef: RefObject<HTMLDivElement | null>;
  virtualItems: ReturnType<ReturnType<typeof useVirtualizer>["getVirtualItems"]>;
  totalSize: number;
}

export function useVirtualInfiniteScroll({
  rowCount,
  overscan = 5,
  estimatedRowHeight = 48,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  prefetchThreshold = 0,
}: UseVirtualInfiniteScrollOptions): UseVirtualInfiniteScrollResult {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: rowCount,
    estimateSize: () => estimatedRowHeight,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const lastVirtualItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastVirtualItem) return;
    if (!hasNextPage || isFetchingNextPage) return;
    if (lastVirtualItem.index >= rowCount - 1 - prefetchThreshold) {
      fetchNextPage?.();
    }
  }, [hasNextPage, fetchNextPage, rowCount, isFetchingNextPage, lastVirtualItem, prefetchThreshold]);

  useEffect(() => {
    parentRef.current?.focus();
  }, []);

  return { parentRef, virtualItems, totalSize };
}
