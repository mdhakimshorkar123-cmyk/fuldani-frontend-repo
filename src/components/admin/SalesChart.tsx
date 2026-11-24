'use client';

import { useEffect, useRef, useState } from 'react';
import { takaEn } from '@/lib/format';
import styles from './SalesChart.module.css';

interface Point {
  day: string;
  orders: number;
  revenue: number;
}

function niceMax(v: number) {
  if (v <= 0) return 4;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / exp;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * exp;
}

const compact = (n: number) =>
  n >= 100_000 ? `${(n / 100_000).toFixed(n % 100_000 ? 1 : 0)}L` : n >= 1000 ? `${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : String(n);

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Single-series daily bar chart with hover tooltip. One metric at a time — never dual-axis. */
export function SalesChart({ data, metric }: { data: Point[]; metric: 'revenue' | 'orders' }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = 240;
  const pad = { top: 12, right: 8, bottom: 26, left: 44 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;

  const values = data.map((d) => d[metric]);
  const max = niceMax(Math.max(...values, 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  const slot = data.length ? innerW / data.length : 0;
  const barW = Math.max(2, Math.min(28, slot * 0.62));
  const labelEvery = Math.ceil(data.length / Math.max(1, Math.floor(innerW / 64)));
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const fmt = (v: number) => (metric === 'revenue' ? takaEn(v) : `${v} order${v === 1 ? '' : 's'}`);

  const hovered = hover !== null ? data[hover] : undefined;

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <svg width={width} height={height} role="img" aria-label={`Daily ${metric} chart`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} className={t === 0 ? styles.baseline : styles.grid} />
            <text x={pad.left - 8} y={y(t)} className={styles.axis} textAnchor="end" dominantBaseline="middle">
              {metric === 'revenue' ? compact(t) : Math.round(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const v = d[metric];
          const cx = pad.left + slot * i + slot / 2;
          const h = Math.max(0, (v / max) * innerH);
          const r = Math.min(4, barW / 2, h);
          const x0 = cx - barW / 2;
          const yTop = pad.top + innerH - h;
          // Bar with rounded top corners, square at the baseline.
          const path =
            h > 0
              ? `M${x0},${pad.top + innerH} V${yTop + r} Q${x0},${yTop} ${x0 + r},${yTop} H${x0 + barW - r} Q${x0 + barW},${yTop} ${x0 + barW},${yTop + r} V${pad.top + innerH} Z`
              : '';
          return (
            <g key={d.day}>
              {path && <path d={path} className={hover === i ? styles.barActive : styles.bar} />}
              {i % labelEvery === 0 && (
                <text x={cx} y={height - 8} className={styles.axis} textAnchor="middle">
                  {dayLabel(d.day)}
                </text>
              )}
              {/* Hit target: whole column, wider than the mark. */}
              <rect
                x={pad.left + slot * i}
                y={pad.top}
                width={slot}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {hovered && hover !== null && (
        <div
          className={styles.tooltip}
          style={{
            left: Math.min(Math.max(pad.left + slot * hover + slot / 2, 70), width - 70),
            top: Math.max(0, y(hovered[metric]) - 8),
          }}
        >
          <span>{dayLabel(hovered.day)}</span>
          <strong>{fmt(hovered[metric])}</strong>
          <span>{metric === 'revenue' ? `${hovered.orders} orders` : takaEn(hovered.revenue)}</span>
        </div>
      )}

      {/* Accessible table view */}
      <table className="sr-only">
        <caption>Daily {metric}</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Orders</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d.orders}</td>
              <td>{d.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
