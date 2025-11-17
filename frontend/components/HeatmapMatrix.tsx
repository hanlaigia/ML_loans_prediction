"use client";
import React from "react";

export default function HeatmapMatrix({
  matrix,
  xLabels,
  yLabels,
}: {
  matrix: number[][];
  xLabels: string[];
  yLabels: string[];
}) {
  const w = 360;
  const h = 360;
  const cols = xLabels.length;
  const rows = yLabels.length;

  const cell = Math.min(w / cols, h / rows);
  const colorScale = [
    { t: 0.0, color: "#deebf7" },
    { t: 0.5, color: "#9ecae1" },
    { t: 1.0, color: "#08519c" },
  ];

  const ticks = [0, 20, 40, 60, 80, 100];

  const hexToRgb = (hex: string) => {
    const num = parseInt(hex.replace("#", ""), 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const interpolateColor = (c1: string, c2: string, t: number) => {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    return `rgb(
      ${Math.round(a.r + (b.r - a.r) * t)},
      ${Math.round(a.g + (b.g - a.g) * t)},
      ${Math.round(a.b + (b.b - a.b) * t)}
    )`;
  };

  const getColor = (value: number) => {
    const t = value / 100;

    if (t <= 0.5)
      return interpolateColor(colorScale[0].color, colorScale[1].color, t / 0.5);

    return interpolateColor(colorScale[1].color, colorScale[2].color, (t - 0.5) / 0.5);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
      <svg width={w + 120} height={h + 80}>
        {/* Y LABELS */}
        {yLabels.map((lbl, i) => (
          <text
            key={i}
            x={0}
            y={i * cell + cell / 1.6}
            fontSize="16"
            fontWeight={600}
          >
            {lbl}
          </text>
        ))}

        {/* X LABELS */}
        {xLabels.map((lbl, i) => (
          <text
            key={i}
            x={60 + i * cell + cell / 2}
            y={h + 45}
            textAnchor="middle"
            fontSize="16"
            fontWeight={600}
          >
            {lbl}
          </text>
        ))}

        {/* CELLS */}
        {matrix.map((row, y) =>
          row.map((value, x) => (
            <g key={`${x}-${y}`}>
              <rect
                x={60 + x * cell}
                y={y * cell}
                width={cell}
                height={cell}
                fill={getColor(Number(value))}
                stroke="#fff"
                rx={14}
              />

              <text
                x={60 + x * cell + cell / 2}
                y={y * cell + cell / 2 + 6}
                fontSize="18"
                fontWeight="600"
                textAnchor="middle"
                fill="#000"
              >
                {Number(value).toFixed(2)}%
              </text>
            </g>
          ))
        )}
      </svg>

      {/* LEGEND */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: 30,
            height: 260,
            background: `linear-gradient(to top, ${colorScale[0].color}, ${colorScale[1].color}, ${colorScale[2].color})`,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        {ticks.map((t, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 40,
              top: 260 - (t / 100) * 260 - 6,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {t}%
          </div>
        ))}
      </div>
    </div>
  );
}
