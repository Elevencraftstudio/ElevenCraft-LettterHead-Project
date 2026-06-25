import { useState, useRef, useId, type ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  shortcut?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ children, content, shortcut, position = 'top', delay = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <span aria-describedby={visible ? id : undefined}>
        {children}
      </span>
      {visible && (
        <div
          id={id}
          className={`absolute z-[400] pointer-events-none ${positions[position]}`}
          role="tooltip"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
            <div className="text-[11px] text-slate-200">{content}</div>
            {shortcut && (
              <kbd className="text-[9px] font-mono text-slate-500 bg-slate-800 px-1 py-0.5 rounded mt-0.5 inline-block">
                {shortcut}
              </kbd>
            )}
          </div>
        </div>
      )}
    </div>
  );
}