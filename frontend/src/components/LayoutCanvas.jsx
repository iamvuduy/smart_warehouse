import React, { useMemo, useState } from "react";

const SVG_W = 1150;
const SVG_H = 900;
const BLOCK_COLS = 2;
const BLOCK_ROWS = 2;
const ROW_COUNT = 4;
const CELLS_PER_BLOCK = BLOCK_COLS * BLOCK_ROWS;
const CELLS_PER_ZONE = CELLS_PER_BLOCK * ROW_COUNT;
const MAX_CELL_GAP_PX = 3;
const DEFAULT_ZONE_ORDER = ["A", "B", "C", "D"];

const DEFAULT_WAREHOUSE = {
  width_m: 100,
  height_m: 50,
  zones: [
    { id: "A", from_m: 0, to_m: 25 },
    { id: "B", from_m: 25, to_m: 50 },
    { id: "C", from_m: 50, to_m: 75 },
    { id: "D", from_m: 75, to_m: 100 },
  ],
  rack: {
    length_m: 3.6,
    width_m: 3,
    levels: 7,
    cluster_size: 3,
    aisle_m: 4,
  },
};

const zoneStyles = {
  A: { base: "#f6ad20", light: "#fde68a", idle: "#fef3c7", stroke: "#b45309" },
  B: { base: "#38bdf8", light: "#bae6fd", idle: "#e0f2fe", stroke: "#0284c7" },
  C: { base: "#34d399", light: "#bbf7d0", idle: "#dcfce7", stroke: "#047857" },
  D: { base: "#a855f7", light: "#e9d5ff", idle: "#f3e8ff", stroke: "#7c3aed" },
};

const FALLBACK_STYLE = {
  base: "#94a3b8",
  light: "#cbd5f5",
  idle: "#e2e8f0",
  stroke: "#475569",
};

export default function LayoutCanvas({ data }) {
  const [hover, setHover] = useState(null);

  // Debug: log when hover changes
  React.useEffect(() => {
    if (hover) {
      console.log("Hover data:", hover.data);
    }
  }, [hover]);

  const warehouse = data?.warehouse ?? DEFAULT_WAREHOUSE;
  const rackCfg = warehouse.rack ?? DEFAULT_WAREHOUSE.rack;
  const rawZones = warehouse.zones ?? DEFAULT_WAREHOUSE.zones;

  const zoneIds = rawZones.map((z) => z.id).filter(Boolean);
  const orderedZones = zoneIds.length ? zoneIds : DEFAULT_ZONE_ORDER;

  const zones = useMemo(
    () =>
      orderedZones.map(
        (id) => rawZones.find((zone) => zone.id === id) ?? { id }
      ),
    [orderedZones, rawZones]
  );

  const placements = data?.placements ?? [];

  const grouped = useMemo(() => {
    const map = new Map(orderedZones.map((id) => [id, []]));
    placements.forEach((item) => {
      const zoneId = item.zone ?? orderedZones[0] ?? DEFAULT_ZONE_ORDER[0];
      if (!map.has(zoneId)) {
        map.set(zoneId, []);
      }
      const zoneItems = map.get(zoneId);
      if (zoneItems.length < CELLS_PER_ZONE) {
        zoneItems.push(item);
      }
    });
    return map;
  }, [placements, orderedZones]);

  const width = warehouse.width_m || DEFAULT_WAREHOUSE.width_m;
  const height = warehouse.height_m || DEFAULT_WAREHOUSE.height_m;

  const scale = Math.min(SVG_W / width, SVG_H / height);
  const contentWidthPx = width * scale;
  const contentHeightPx = height * scale;
  const offsetX = (SVG_W - contentWidthPx) / 2;
  const offsetY = (SVG_H - contentHeightPx) / 2;

  const aisle = rackCfg.aisle_m ?? 4;
  const rackLength = rackCfg.length_m ?? 3.6;
  const rackDepth = Math.max(1, rackCfg.width_m ?? 3);

  const zoneCount = zones.length || DEFAULT_ZONE_ORDER.length;
  const baseColumnWidth = (width - aisle * (zoneCount + 1)) / zoneCount;
  const columnWidthMeters =
    baseColumnWidth > 0 ? baseColumnWidth : width / Math.max(zoneCount, 1);
  const columnWidthPx = columnWidthMeters * scale;

  const marginMeters = Math.max(columnWidthMeters * 0.1, 0.6);
  let columnInnerWidthMeters = columnWidthMeters - marginMeters * 2;
  if (columnInnerWidthMeters <= 0) {
    columnInnerWidthMeters = columnWidthMeters * 0.8;
  }

  const cellGapMeters = Math.max(columnWidthMeters * 0.025, 0.18);
  let cellSizeMeters =
    (columnInnerWidthMeters - (BLOCK_COLS - 1) * cellGapMeters) / BLOCK_COLS;

  if (!Number.isFinite(cellSizeMeters) || cellSizeMeters <= 0) {
    cellSizeMeters =
      (columnWidthMeters - cellGapMeters * (BLOCK_COLS - 1)) / BLOCK_COLS;
  }
  if (!Number.isFinite(cellSizeMeters) || cellSizeMeters <= 0) {
    cellSizeMeters = Math.max(columnWidthMeters / (BLOCK_COLS * 1.6), 0.5);
  }

  cellSizeMeters = Math.max(cellSizeMeters * 0.78, 0.4);

  const cellSizePx = cellSizeMeters * scale;

  const blockWidthMeters =
    BLOCK_COLS * cellSizeMeters + (BLOCK_COLS - 1) * cellGapMeters;
  const blockHeightMeters =
    BLOCK_ROWS * cellSizeMeters + (BLOCK_ROWS - 1) * cellGapMeters;

  let blockGapMeters = Math.max(blockHeightMeters * 5.25, cellGapMeters * 16.5);
  blockGapMeters = Math.max(blockGapMeters, aisle * 1.8);
  let verticalPaddingMeters = Math.max(blockGapMeters * 0.7, aisle * 0.45);

  let totalBlocksHeightMeters =
    ROW_COUNT * blockHeightMeters + (ROW_COUNT - 1) * blockGapMeters;
  let totalZoneHeightMeters =
    totalBlocksHeightMeters + verticalPaddingMeters * 2;

  if (totalZoneHeightMeters > height) {
    const availableForGaps = Math.max(
      height - verticalPaddingMeters * 2 - ROW_COUNT * blockHeightMeters,
      0
    );
    blockGapMeters =
      ROW_COUNT > 1
        ? Math.max(cellGapMeters * 16.5, availableForGaps / (ROW_COUNT - 1))
        : 0;

    totalBlocksHeightMeters =
      ROW_COUNT * blockHeightMeters + (ROW_COUNT - 1) * blockGapMeters;

    const remainingForPadding = Math.max(height - totalBlocksHeightMeters, 0);
    verticalPaddingMeters = remainingForPadding / 2;
    totalZoneHeightMeters = totalBlocksHeightMeters + verticalPaddingMeters * 2;
  }

  const centeredZoneTopMeters = Math.max(
    0,
    (height - totalZoneHeightMeters) / 2
  );
  const maxTopPaddingMeters = Math.min(
    centeredZoneTopMeters,
    scale > 0 ? 100 / scale : centeredZoneTopMeters
  );
  const zoneRectTopMeters = maxTopPaddingMeters;
  const topOffsetMeters = zoneRectTopMeters + verticalPaddingMeters;

  const zoneLabelGapPx = 150;
  const zoneLabelGapMeters = scale > 0 ? zoneLabelGapPx / scale : 0;
  const zoneRectBottomMeters = zoneRectTopMeters + totalZoneHeightMeters;
  const adjustedZoneTopMeters = zoneRectTopMeters + zoneLabelGapMeters;
  const zoneRectHeightMeters = Math.max(
    zoneRectBottomMeters - adjustedZoneTopMeters,
    blockHeightMeters
  );

  const zoneRectY = offsetY + adjustedZoneTopMeters * scale;
  const zoneRectHeight = zoneRectHeightMeters * scale;
  // Fixed position: 40px from top of canvas - well above the cells
  const zoneLabelY = 40;

  const gapPx = Math.min(MAX_CELL_GAP_PX, cellSizePx * 0.12);

  const renderZone = (zone, zoneIndex) => {
    const items = grouped.get(zone.id) ?? [];
    const columnStartMeters = aisle + zoneIndex * (columnWidthMeters + aisle);
    const columnStartPx = offsetX + columnStartMeters * scale;
    const style = zoneStyles[zone.id] ?? FALLBACK_STYLE;
    const blockStartMeters =
      columnStartMeters + (columnWidthMeters - blockWidthMeters) / 2;

    const cells = [];
    for (let blockIndex = 0; blockIndex < ROW_COUNT; blockIndex += 1) {
      const blockBaseMeters =
        topOffsetMeters + blockIndex * (blockHeightMeters + blockGapMeters);

      for (let innerRow = 0; innerRow < BLOCK_ROWS; innerRow += 1) {
        const yMeters =
          blockBaseMeters + innerRow * (cellSizeMeters + cellGapMeters);
        const yPx = offsetY + yMeters * scale + gapPx / 2;

        for (let col = 0; col < BLOCK_COLS; col += 1) {
          const slotIndex =
            blockIndex * CELLS_PER_BLOCK + innerRow * BLOCK_COLS + col;
          const item = items[slotIndex];
          const active = Boolean(item);
          const xMeters =
            blockStartMeters + col * (cellSizeMeters + cellGapMeters);
          const xPx = offsetX + xMeters * scale + gapPx / 2;

          const rectSize = Math.max(6, cellSizePx - gapPx);
          const innerSize = rectSize * 0.84;
          const innerOffset = (rectSize - innerSize) / 2;

          cells.push(
            <g key={`${zone.id}-${blockIndex}-${innerRow}-${col}`}>
              {/* Main cell background */}
              <rect
                x={xPx}
                y={yPx}
                width={rectSize}
                height={rectSize}
                rx={7}
                ry={7}
                fill={active ? style.light : style.idle}
                stroke={style.stroke}
                strokeWidth={1.6}
                style={{ pointerEvents: "none" }}
              />

              {/* Inner cell */}
              <rect
                x={xPx + innerOffset}
                y={yPx + innerOffset}
                width={innerSize}
                height={innerSize}
                rx={5}
                ry={5}
                fill={active ? style.base : `${style.base}1A`}
                stroke={active ? style.stroke : `${style.stroke}44`}
                strokeWidth={1}
                style={{ pointerEvents: "none" }}
              />

              {/* Hover area - smaller padding for closer interaction */}
              <rect
                x={xPx - 5}
                y={yPx - 5}
                width={rectSize + 10}
                height={rectSize + 10}
                fill="transparent"
                style={{
                  cursor: active ? "pointer" : "default",
                  pointerEvents: active ? "all" : "none",
                }}
                onMouseEnter={(event) => {
                  if (!active) return;

                  const rect = event.currentTarget.getBoundingClientRect();

                  const tooltipWidth = 200;
                  const tooltipHeight = 85; // Reduced height
                  const gap = 4; // Minimal gap

                  // Use the hover rect's actual position (already includes scroll)
                  const centerX = rect.left + rect.width / 2;
                  const bottomY = rect.top;

                  // Center tooltip horizontally with the box
                  let tooltipX = centerX - tooltipWidth / 2;

                  // Position tooltip ABOVE the box with minimal gap
                  let tooltipY = bottomY - tooltipHeight - gap;

                  // Adjust if tooltip goes off-screen horizontally
                  const margin = 10;
                  tooltipX = Math.max(
                    margin,
                    Math.min(
                      tooltipX,
                      window.innerWidth - tooltipWidth - margin
                    )
                  );

                  // If not enough space above, show below
                  if (tooltipY < margin) {
                    tooltipY = rect.bottom + gap;
                  }

                  setHover({
                    x: tooltipX,
                    y: tooltipY,
                    data: { ...item, zone: zone.id },
                  });
                }}
                onMouseLeave={() => {
                  setHover(null);
                }}
              />

              <circle
                cx={xPx + rectSize / 2}
                cy={yPx + rectSize / 2}
                r={rectSize * 0.18}
                fill={active ? "rgba(15, 23, 42, 0.85)" : `${style.stroke}44`}
                stroke={active ? "#ffffff" : "transparent"}
                strokeWidth={active ? 1 : 0}
              />
              {active && (
                <>
                  <text
                    x={xPx + rectSize / 2}
                    y={yPx + rectSize / 2 - 6}
                    fontSize={8}
                    fontWeight={600}
                    fill="#ffffff"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {item.sku_code}
                  </text>
                  {item.position_id && (
                    <text
                      x={xPx + rectSize / 2}
                      y={yPx + rectSize / 2 + 8}
                      fontSize={6}
                      fill="#e2e8f0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {item.position_id}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        }
      }
    }

    return (
      <g key={`zone-${zone.id}`}>
        <rect
          x={columnStartPx}
          y={zoneRectY}
          width={columnWidthPx}
          height={zoneRectHeight}
          fill={style.idle}
          fillOpacity={0.18}
        />

        {cells}
      </g>
    );
  };

  const hasPlacements = placements.length > 0;

  return (
    <div className="relative w-full" style={{ height: SVG_H }}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height="100%"
        className="block"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#ffffff" />

        {zones.map((zone, index) => renderZone(zone, index))}

        {/* Zone labels - rendered after zones so they appear on top */}
        {zones.map((zone, zoneIndex) => {
          const columnStartMeters =
            aisle + zoneIndex * (columnWidthMeters + aisle);
          const columnStartPx = offsetX + columnStartMeters * scale;
          const style = zoneStyles[zone.id] ?? FALLBACK_STYLE;

          return (
            <g
              key={`zone-label-${zone.id}`}
              transform={`translate(${
                columnStartPx + columnWidthPx / 2
              }, ${zoneLabelY})`}
            >
              <rect
                x={-30}
                y={-28}
                width={60}
                height={44}
                rx={8}
                fill="white"
                stroke={style.stroke}
                strokeWidth={2.5}
                opacity={0.98}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
              />
              <text
                x={0}
                y={0}
                fontSize={32}
                fontWeight={800}
                fill={style.base}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {zone.id}
              </text>
            </g>
          );
        })}

        {/* Main Entrance - horizontal, left of Zone A, above first block */}
        <g
          transform={`translate(${offsetX + 10}, ${
            offsetY + topOffsetMeters * scale - 60
          })`}
        >
          <text
            x={0}
            y={0}
            fontSize={16}
            fontWeight={700}
            fill="#000000"
            textAnchor="start"
          >
            ENTRANCE →
          </text>
        </g>

        {/* Legend - horizontal bar at top center, below title */}
        <g transform={`translate(${SVG_W / 2}, 90)`}>
          {/* Background box */}
          <rect
            x={-200}
            y={0}
            width={400}
            height={44}
            rx={10}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth={2}
            opacity={0.98}
            filter="drop-shadow(0 2px 6px rgba(0,0,0,0.1))"
          />

          {/* Legend items arranged horizontally */}
          {zones.map((zone, idx) => {
            const style = zoneStyles[zone.id] ?? FALLBACK_STYLE;
            const xOffset = -180 + idx * 100;

            return (
              <g
                key={`legend-${zone.id}`}
                transform={`translate(${xOffset}, 22)`}
              >
                <rect
                  x={0}
                  y={0}
                  width={24}
                  height={24}
                  rx={4}
                  fill={style.base}
                  stroke={style.stroke}
                  strokeWidth={2}
                />
                <text
                  x={32}
                  y={15}
                  fontSize={14}
                  fontWeight={600}
                  fill="#1f2937"
                  textAnchor="start"
                >
                  Zone {zone.id}
                </text>
              </g>
            );
          })}
        </g>

        {/* removed empty-state message per user request */}
      </svg>

      {hover && (
        <div
          className="absolute z-50 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-2xl border border-slate-600"
          style={{
            left: hover.x,
            top: hover.y,
            pointerEvents: "none",
            width: "200px",
            position: "fixed", // Use fixed to avoid layout shifts
          }}
        >
          {/* SKU Code - Header */}
          <div className="font-bold text-sm mb-1 text-blue-300">
            {hover.data.sku_code}
          </div>

          {/* Product Name */}
          {hover.data.product_name && (
            <div className="mb-1">
              <div className="text-white font-medium text-xs leading-tight">
                {hover.data.product_name}
              </div>
            </div>
          )}

          {/* Priority */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700">
            <span className="text-slate-400 text-xs">Priority:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-300 font-bold text-sm">
                {hover.data.priority?.toFixed?.(4) ??
                  (typeof hover.data.priority === "number"
                    ? hover.data.priority.toFixed(4)
                    : hover.data.priority)}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                  hover.data.priority >= 0.7
                    ? "bg-orange-600"
                    : hover.data.priority >= 0.5
                    ? "bg-blue-600"
                    : hover.data.priority >= 0.3
                    ? "bg-green-600"
                    : "bg-purple-600"
                }`}
              >
                Zone {hover.data.zone}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
