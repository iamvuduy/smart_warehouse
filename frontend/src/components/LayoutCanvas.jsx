import React, { useMemo, useState } from "react";

const SVG_W = 960;
const SVG_H = 540;
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
  const areaSqM = Math.round(width * height);

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

  let blockGapMeters = Math.max(blockHeightMeters * 1.75, cellGapMeters * 5.5);
  blockGapMeters = Math.max(blockGapMeters, aisle * 0.6);
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
        ? Math.max(cellGapMeters * 2.2, availableForGaps / (ROW_COUNT - 1))
        : 0;

    totalBlocksHeightMeters =
      ROW_COUNT * blockHeightMeters + (ROW_COUNT - 1) * blockGapMeters;

    const remainingForPadding = Math.max(height - totalBlocksHeightMeters, 0);
    verticalPaddingMeters = remainingForPadding / 2;
    totalZoneHeightMeters = totalBlocksHeightMeters + verticalPaddingMeters * 2;
  }

  const zoneRectTopMeters = Math.max(0, (height - totalZoneHeightMeters) / 2);
  const topOffsetMeters = zoneRectTopMeters + verticalPaddingMeters;

  const zoneRectY = offsetY + zoneRectTopMeters * scale;
  const zoneRectHeight = totalZoneHeightMeters * scale;
  const zoneLabelOffsetPx = Math.min(36, zoneRectHeight * 0.12);
  const zoneLabelY = zoneRectY + zoneLabelOffsetPx;

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
                onMouseEnter={(event) =>
                  active &&
                  setHover({
                    x: event.clientX,
                    y: event.clientY,
                    data: { ...item, zone: zone.id },
                  })
                }
                onMouseMove={(event) =>
                  active &&
                  setHover({
                    x: event.clientX,
                    y: event.clientY,
                    data: { ...item, zone: zone.id },
                  })
                }
                onMouseLeave={() => setHover(null)}
              />
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
                <text
                  x={xPx + rectSize / 2}
                  y={yPx + rectSize / 2}
                  fontSize={9}
                  fill="#ffffff"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {item.sku_code}
                </text>
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
        <text
          x={columnStartPx + columnWidthPx / 2}
          y={zoneLabelY}
          fontSize={26}
          fontWeight={800}
          fill={style.stroke}
          textAnchor="middle"
        >
          {zone.id}
        </text>
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

        <g
          transform={`translate(${Math.max(offsetX - 110, 16)}, ${Math.max(
            offsetY - 20,
            24
          )})`}
        >
          <text x={0} y={0} fontSize={24} fontWeight={700} fill="#1f2937">
            2D Warehouse Layout
          </text>
          <text x={0} y={22} fontSize={12} fill="#475569">
            Area: {areaSqM.toLocaleString()} m² · Footprint: {width} m ×{" "}
            {height} m · Levels: {rackCfg.levels ?? 0}
          </text>
          <text x={0} y={38} fontSize={12} fill="#475569">
            Rack spec: {rackLength.toFixed(1)} m (L) × {rackDepth.toFixed(1)} m
            (W), aisle ≥ {aisle} m
          </text>
        </g>

        <g
          transform={`translate(${offsetX + 24}, ${
            offsetY + contentHeightPx / 2
          })`}
        >
          <text
            x={0}
            y={0}
            fontSize={12}
            fill="#1f2937"
            textAnchor="middle"
            transform="rotate(-90)"
          >
            MAIN ENTRANCE
          </text>
          <polygon points="0,-44 -9,-26 9,-26" fill="#1f2937" />
        </g>

        {zones.map((zone, idx) => (
          <g
            key={`legend-${zone.id}`}
            transform={`translate(${620 + idx * 80}, ${SVG_H - 36})`}
          >
            <rect
              x={0}
              y={0}
              width={14}
              height={14}
              fill={zoneStyles[zone.id]?.base ?? FALLBACK_STYLE.base}
            />
            <text x={20} y={12} fontSize={12} fill="#1f2937">
              Zone {zone.id}
            </text>
          </g>
        ))}

        {!hasPlacements && (
          <text
            x={SVG_W / 2}
            y={SVG_H / 2}
            fontSize={18}
            fill="#94a3b8"
            textAnchor="middle"
          >
            No SKUs assigned yet. Run "Optimize Placement" to populate the map.
          </text>
        )}
      </svg>

      {hover && (
        <div
          className="absolute z-50 rounded bg-slate-900 px-3 py-2 text-sm text-white shadow-lg"
          style={{ left: hover.x + 14, top: hover.y - 40 }}
        >
          <div className="font-semibold">{hover.data.sku_code}</div>
          <div>Zone: {hover.data.zone}</div>
          <div>
            Priority:{" "}
            {hover.data.priority?.toFixed?.(4) ??
              (typeof hover.data.priority === "number"
                ? hover.data.priority.toFixed(4)
                : hover.data.priority)}
          </div>
        </div>
      )}
    </div>
  );
}
