import React, { useState, useRef, useCallback, useEffect, memo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  placeholderHeight?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  overscan = 3,
  renderItem,
  className = '',
  placeholderHeight,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    setScrollTop(containerRef.current?.scrollTop ?? 0);
  }, []);

  const totalHeight = Math.max(items.length * itemHeight, placeholderHeight ?? containerHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto scrollbar-thin ${className}`}
      role="list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }} role="listitem">
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  gap?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  gap = 8,
  overscan = 2,
  renderItem,
  className = '',
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cols = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
  const rows = Math.ceil(items.length / cols);
  const totalHeight = rows * (itemHeight + gap) - gap;

  const handleScroll = useCallback(() => {
    setScrollTop(containerRef.current?.scrollTop ?? 0);
  }, []);

  const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
  const clientH = containerRef.current?.clientHeight ?? 400;
  const endRow = Math.min(rows, Math.ceil((scrollTop + clientH) / (itemHeight + gap)) + overscan);

  const startIndex = startRow * cols;
  const endIndex = Math.min(items.length, endRow * cols);
  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto scrollbar-thin ${className}`}
      role="list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap,
            transform: `translateY(${startRow * (itemHeight + gap)}px)`,
          }}
        >
          {visibleItems.map((item, i) => {
            const globalIndex = startIndex + i;
            return (
              <div
                key={globalIndex}
                style={{ width: itemWidth, height: itemHeight }}
                role="listitem"
              >
                {renderItem(item, globalIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
