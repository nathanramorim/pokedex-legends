'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { computeWindow } from './virtual-window';

interface Options {
  itemCount: number;
  minColumnWidth: number;
  rowHeight: number;
  gap: number;
}

export interface VirtualGrid {
  columns: number;
  rowCount: number;
  start: number;
  end: number;
  totalHeight: number;
  rowTop: (row: number) => number;
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Grade virtualizada baseada na rolagem da janela: só as linhas visíveis ficam no DOM. */
export function useVirtualGrid({
  itemCount,
  minColumnWidth,
  rowHeight,
  gap,
}: Options): [RefObject<HTMLDivElement | null>, VirtualGrid] {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [range, setRange] = useState({ scrollTop: 0, viewportHeight: 0 });

  const columns = Math.max(2, Math.floor((width + gap) / (minColumnWidth + gap)) || 2);
  const rowCount = Math.ceil(itemCount / columns);
  const pitch = rowHeight + gap;

  useIsoLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setWidth(el.clientWidth);
      setRange({ scrollTop: -el.getBoundingClientRect().top, viewportHeight: window.innerHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { start, end } = computeWindow({ ...range, rowHeight: pitch, rowCount });
  return [
    containerRef,
    {
      columns,
      rowCount,
      start,
      end,
      totalHeight: Math.max(0, rowCount * pitch - gap),
      rowTop: (row) => row * pitch,
    },
  ];
}
