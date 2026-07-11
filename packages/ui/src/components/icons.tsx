"use client";

import * as React from "react";

import { cn } from "../lib/cn";

/**
 * Icons — ORVIX Design System v1.0.
 *
 * A small starter set, geometric, 1.5px stroke, drawn on a 16x16
 * canvas. Full icon set (24x24, ~80 icons) lands in M3. This is
 * the minimum needed to make the v1.0 components work.
 */

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "size"> {
  size?: number | undefined;
  className?: string | undefined;
}

const baseSvgProps: React.SVGAttributes<SVGSVGElement> = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({
  size = 16,
  className,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      {...baseSvgProps}
      {...props}
      className={cn("shrink-0", className)}
    >
      {children}
    </svg>
  );
}

export const X = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <line x1="3" y1="3" x2="13" y2="13" />
    <line x1="13" y1="3" x2="3" y2="13" />
  </Svg>
);

export const Check = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <polyline points="3 8 7 12 13 4" />
  </Svg>
);

export const ChevronDown = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <polyline points="3 6 8 11 13 6" />
  </Svg>
);

export const ChevronRight = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <polyline points="6 3 11 8 6 13" />
  </Svg>
);

export const ChevronLeft = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <polyline points="11 3 6 8 11 13" />
  </Svg>
);

export const Plus = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </Svg>
);

export const Search = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <circle cx="7" cy="7" r="4" />
    <line x1="10" y1="10" x2="13" y2="13" />
  </Svg>
);

export const Bell = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <path d="M3.5 12h9l-1-2v-3a3.5 3.5 0 0 0-7 0v3z" />
    <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
  </Svg>
);

export const Settings = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5l1.5 1.5M3 13l1.5-1.5M11.5 4.5l1.5-1.5" />
  </Svg>
);

export const Inbox = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <path d="M2 9l1.5-5h9L14 9v4H2z" />
    <path d="M2 9h3.5l1 1.5h3l1-1.5H14" />
  </Svg>
);

export const Users = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <path d="M2 13c.5-2 2-3 4-3s3.5 1 4 3" />
    <circle cx="11" cy="5" r="2" />
    <path d="M11 9c1.5 0 3 1 3.5 3" />
  </Svg>
);

export const Briefcase = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <rect x="2" y="5" width="12" height="9" rx="1" />
    <path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" />
  </Svg>
);

export const Folder = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3H6l1.5 2h5A1.5 1.5 0 0 1 14 6.5v5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z" />
  </Svg>
);

export const CheckSquare = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <rect x="2.5" y="2.5" width="11" height="11" rx="1" />
    <polyline points="5 8 7 10 11 6" />
  </Svg>
);

export const Message = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <path d="M2.5 4.5A1.5 1.5 0 0 1 4 3h8a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 12H6l-3 2v-2H4a1.5 1.5 0 0 1-1.5-1.5z" />
  </Svg>
);

export const File = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <path d="M4 2h5l3 3v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
    <polyline points="9 2 9 5 12 5" />
  </Svg>
);

export const InboxTray = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <path d="M2 11l1.5-7h9L14 11" />
    <path d="M2 11h3.5l1 1.5h3l1-1.5H14v2H2z" />
  </Svg>
);

export const BarChart = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <line x1="2" y1="13" x2="14" y2="13" />
    <rect x="4" y="8" width="2" height="5" />
    <rect x="7" y="5" width="2" height="8" />
    <rect x="10" y="3" width="2" height="10" />
  </Svg>
);

export const Sparkles = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <path d="M8 1.5l1.5 4 4 1.5-4 1.5L8 12.5l-1.5-4-4-1.5 4-1.5z" />
    <path d="M13 9l.5 1.5 1.5.5-1.5.5L13 13l-.5-1.5L11 11l1.5-.5z" />
  </Svg>
);

export const ArrowRight = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <line x1="2" y1="8" x2="13" y2="8" />
    <polyline points="9 4 13 8 9 12" />
  </Svg>
);

export const More = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <circle cx="3.5" cy="8" r="1" fill="currentColor" />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
    <circle cx="12.5" cy="8" r="1" fill="currentColor" />
  </Svg>
);

export const Filter = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <polygon points="2 3 14 3 9 9 9 13 7 12 7 9 2 3" />
  </Svg>
);

export const Calendar = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <rect x="2" y="3.5" width="12" height="11" rx="1" />
    <line x1="2" y1="6.5" x2="14" y2="6.5" />
    <line x1="5" y1="2" x2="5" y2="5" />
    <line x1="11" y1="2" x2="11" y2="5" />
  </Svg>
);

export const List = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <line x1="3" y1="4" x2="14" y2="4" />
    <line x1="3" y1="8" x2="14" y2="8" />
    <line x1="3" y1="12" x2="14" y2="12" />
  </Svg>
);

export const Clock = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <circle cx="8" cy="8" r="6" />
    <polyline points="8 5 8 8 10 10" />
  </Svg>
);

export const Trash = ({ size, className, ...p }: IconProps) => (
  <Svg size={size} className={className} {...p}>
    <path d="M3 4h10M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5 4l1 9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1l1-9" />
  </Svg>
);
