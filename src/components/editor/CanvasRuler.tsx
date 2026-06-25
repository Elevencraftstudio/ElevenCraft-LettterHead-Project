import React, { useMemo } from 'react';

interface CanvasRulerProps {
  orientation: 'horizontal' | 'vertical';
  zoom: number;
  viewportOffset: number;
  length: number;
}

export function CanvasRuler({ orientation, zoom, viewportOffset, length }: CanvasRulerProps) {
  const isHorizontal = orientation === 'horizontal';

  const ticks = useMemo(() => {
    const step = 50;
    const count = Math.ceil(length / (step * zoom));
    const result: { pos: number; label: string; size: 'major' | 'minor' }[] = [];

    for (let i = 0; i <= count; i++) {
      const pos = i * step * zoom - (viewportOffset % (step * zoom));
      if (pos < 0 || pos > length) continue;
      const value = Math.round(i * step);
      if (value % 100 === 0) {
        result.push({ pos, label: String(value), size: 'major' });
      } else {
        result.push({ pos, label: '', size: 'minor' });
      }
    }
    return result;
  }, [length, zoom, viewportOffset]);

  return (
    <div
      className={`relative bg-slate-900 border-slate-700 overflow-hidden select-none ${
        isHorizontal ? 'w-full h-6 border-b' : 'h-full w-6 border-r'
      }`}
    >
      {ticks.map((tick, i) => (
        <div
          key={i}
          className={`absolute ${isHorizontal ? 'bottom-0' : 'right-0'}`}
          style={isHorizontal ? { left: tick.pos } : { top: tick.pos }}
        >
          {tick.size === 'major' && (
            <>
              <div className={`absolute ${isHorizontal ? 'h-4 bottom-0' : 'w-4 right-0'} bg-slate-600`}
                style={isHorizontal ? { left: 0, width: 1 } : { top: 0, height: 1 }}
              />
              <span className={`text-[8px] text-slate-400 absolute ${isHorizontal ? 'left-2 top-0.5' : '-left-0.5 top-2 rotate-90 origin-left whitespace-nowrap'}`}>
                {tick.label}
              </span>
            </>
          )}
          {tick.size === 'minor' && (
            <div className={`absolute bg-slate-600`}
              style={isHorizontal ? { left: tick.pos, bottom: 0, width: 1, height: 2 } : { top: tick.pos, right: 0, height: 1, width: 2 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
