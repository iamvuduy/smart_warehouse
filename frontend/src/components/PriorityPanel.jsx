import React, { useMemo, useState } from "react";

function normalizeInputs(raw) {
  const safe = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const rf = safe(raw.f);
  const rw = safe(raw.w);
  const rs = safe(raw.s);
  const ri = safe(raw.i);

  const f = rf >= 0 && rf <= 1 ? rf : Math.min(1, rf / 200);
  const w = rw >= 0 && rw <= 1 ? rw : Math.min(1, rw / 20);
  const s = rs >= 0 && rs <= 1 ? rs : Math.min(1, rs / 50000);
  const i = ri >= 0 && ri <= 1 ? ri : Math.min(1, ri / 20);

  return { f, w, s, i };
}

function calculatePriority(f, w, s, i) {
  const priority = 0.38 * f + 0.24 * w + 0.2 * s + 0.18 * i;
  const clamped = Math.max(0, Math.min(1, priority));
  return Math.round(clamped * 10000) / 10000;
}

function priorityToZone(p) {
  if (p >= 0.7) return "A";
  if (p >= 0.5) return "B";
  if (p >= 0.3) return "C";
  return "D";
}

export default function PriorityPanel() {
  const [inputs, setInputs] = useState({ f: "", w: "", s: "", i: "" });

  const normalized = useMemo(() => normalizeInputs(inputs), [inputs]);
  const priority = useMemo(
    () =>
      calculatePriority(normalized.f, normalized.w, normalized.s, normalized.i),
    [normalized]
  );
  const zone = useMemo(() => priorityToZone(priority), [priority]);

  return (
    <div className="bg-slate-50 border rounded-lg p-4">
      <h3 className="font-semibold mb-2">Priority Calculator</h3>
      <p className="text-xs text-slate-500 mb-4">
        Enter raw numbers or normalized values to preview the resulting priority
        score and suggested zone.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-600">Outbound Freq (F)</label>
            <input
              className="w-full p-2 border rounded mt-1"
              value={inputs.f}
              onChange={(e) => setInputs({ ...inputs, f: e.target.value })}
              placeholder="e.g. 50 or 0.25"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Normalized: F / 200
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-600">Weight (W)</label>
            <input
              className="w-full p-2 border rounded mt-1"
              value={inputs.w}
              onChange={(e) => setInputs({ ...inputs, w: e.target.value })}
              placeholder="e.g. 20 or 0.4"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Normalized: W / 20
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-600">Volume (S)</label>
            <input
              className="w-full p-2 border rounded mt-1"
              value={inputs.s}
              onChange={(e) => setInputs({ ...inputs, s: e.target.value })}
              placeholder="e.g. 1000 or 0.02"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Normalized: S / 50000
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-600">Inbound Freq (I)</label>
            <input
              className="w-full p-2 border rounded mt-1"
              value={inputs.i}
              onChange={(e) => setInputs({ ...inputs, i: e.target.value })}
              placeholder="e.g. 60 or 0.3"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Normalized: I / 20
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border rounded">
          <h4 className="text-sm text-slate-600">Computed</h4>
          <div className="mt-3 text-sm">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Normalized (0-1)
            </div>
            <div className="mt-2 space-y-1">
              <div>F: {normalized.f.toFixed(4)}</div>
              <div>W: {normalized.w.toFixed(4)}</div>
              <div>S: {normalized.s.toFixed(6)}</div>
              <div>I: {normalized.i.toFixed(4)}</div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-500 uppercase tracking-wide">
                Priority
              </div>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {priority.toFixed(4)}
              </div>
              <div className="mt-2 text-sm">
                Suggested zone: <span className="font-medium">{zone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
