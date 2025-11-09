import React, { useEffect, useState } from "react";
import axios from "axios";
import LayoutCanvas from "./components/LayoutCanvas";
import SkuTable from "./components/SkuTable";

const API_BASE = "http://localhost:8000/api";

export default function AppNew() {
  const [sku, setSku] = useState({
    sku_code: "",
    f: 0.0,
    w: 0.0,
    s: 0.0,
    i: 0.0,
  });
  const [list, setList] = useState([]);
  const [placements, setPlacements] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [optInstructions, setOptInstructions] = useState("");

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    try {
      const res = await axios.get(`${API_BASE}/sku/list`);
      setList(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  function normalizeInputs(raw) {
    // raw values can be either already normalized (0-1) or large integers.
    // Rules: F -> /200, W -> /20, I -> /20, S -> /50000
    const safe = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const rf = safe(raw.f);
    const rw = safe(raw.w);
    const rs = safe(raw.s);
    const ri = safe(raw.i);

    const f = rf >= 0 && rf <= 1 ? rf : Math.min(1, rf / 200);
    const w = rw >= 0 && rw <= 1 ? rw : Math.min(1, rw / 20);
    const i = ri >= 0 && ri <= 1 ? ri : Math.min(1, ri / 20);
    const s = rs >= 0 && rs <= 1 ? rs : Math.min(1, rs / 50000);

    return { f, w, s, i };
  }

  async function handleAdd(e) {
    e.preventDefault();
    setIsAdding(true);
    try {
      const normalized = normalizeInputs(sku);
      const payload = {
        sku_code: sku.sku_code,
        f: normalized.f,
        w: normalized.w,
        s: normalized.s,
        i: normalized.i,
      };
      await axios.post(`${API_BASE}/sku/add`, payload);
      setSku({ sku_code: "", f: 0, w: 0, s: 0, i: 0 });
      await fetchList();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleVisualize() {
    setIsOptimizing(true);
    setAiInsight(null);
    try {
      const payload = optInstructions.trim()
        ? { instructions: optInstructions.trim() }
        : {};
      const res = await axios.post(`${API_BASE}/sku/optimize`, payload);
      setPlacements(res.data);

      const summary = res.data?.assistant_summary ?? null;
      const reassignments = Array.isArray(res.data?.assistant_reassignments)
        ? res.data.assistant_reassignments
        : [];

      if (summary || reassignments.length > 0) {
        setAiInsight({ summary, reassignments });
      }
    } catch (err) {
      console.error(err);
      setAiInsight({
        summary:
          err?.response?.data?.detail ||
          "Unable to run AI optimization. Please try again.",
        reassignments: [],
      });
    } finally {
      setIsOptimizing(false);
    }
  }

  async function resetToDemo() {
    const demo = [
      { sku_code: "SKU001", f: 0.25, w: 0.4, s: 0.2, i: 0.3 },
      { sku_code: "SKU002", f: 0.8, w: 0.7, s: 0.3, i: 0.5 },
      { sku_code: "SKU003", f: 0.15, w: 0.2, s: 0.1, i: 0.2 },
    ];
    try {
      setIsResetting(true);
      setAiInsight(null);
      for (const it of demo) {
        try {
          await axios.post(`${API_BASE}/sku/add`, it);
        } catch (_) {}
      }
      await fetchList();
      await handleVisualize();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold">AI Warehouse Optimizer</h1>
        <p className="text-sm text-slate-600">
          Smart Storage Location Assignment (SLAP)
        </p>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-6">
          <section className="col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">Add New SKU</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600">
                  SKU Name / ID
                </label>
                <input
                  required
                  value={sku.sku_code}
                  onChange={(e) => setSku({ ...sku, sku_code: e.target.value })}
                  className="w-full p-3 border rounded mt-1"
                  placeholder="e.g., Electronics-012"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">
                    Outbound Freq. (F)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sku.f}
                    onChange={(e) =>
                      setSku({
                        ...sku,
                        f: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded mt-1"
                    placeholder="e.g. 50"
                  />
                  <p className="text-xs text-slate-400">
                    Nhập giá trị thực tế, hệ thống tự chuẩn hóa về 0-1.
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Weight (W)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sku.w}
                    onChange={(e) =>
                      setSku({
                        ...sku,
                        w: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded mt-1"
                    placeholder="e.g. 20"
                  />
                  <p className="text-xs text-slate-400">
                    Hệ thống tự chuẩn hóa về thang 0-1.
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Volume (S)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sku.s}
                    onChange={(e) =>
                      setSku({
                        ...sku,
                        s: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded mt-1"
                    placeholder="e.g. 50000"
                  />
                  <p className="text-xs text-slate-400">
                    Hệ thống tự chuẩn hóa về thang 0-1.
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">
                    Inbound Freq. (I)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sku.i}
                    onChange={(e) =>
                      setSku({
                        ...sku,
                        i: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded mt-1"
                    placeholder="e.g. 60"
                  />
                  <p className="text-xs text-slate-400">
                    Hệ thống tự chuẩn hóa về thang 0-1.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  className={
                    "flex-1 px-4 py-3 rounded font-medium text-white transition transform " +
                    (isAdding
                      ? "bg-blue-500 opacity-80 cursor-wait"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500")
                  }
                  aria-busy={isAdding}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <span className="inline-flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "+ Add SKU to List"
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetToDemo}
                  className={
                    "px-4 py-3 rounded text-white transition " +
                    (isResetting
                      ? "bg-slate-700 opacity-80 cursor-wait"
                      : "bg-slate-800 hover:bg-slate-900 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700")
                  }
                  disabled={isResetting}
                  aria-busy={isResetting}
                >
                  {isResetting ? (
                    <span className="inline-flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    "Reset to Demo"
                  )}
                </button>
              </div>
            </form>
          </section>

          <section className="col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">Warehouse Operations</h3>
                <p className="text-sm text-slate-500">
                  Add SKUs and their properties, then click "Optimize Placement"
                  to get AI-powered placement suggestions.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">
                <div className="w-full md:w-64">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    AI Instructions (optional)
                  </label>
                  <textarea
                    value={optInstructions}
                    onChange={(e) => setOptInstructions(e.target.value)}
                    rows={3}
                    placeholder="E.g. keep fastest-moving items in Zone A."
                    className="mt-1 w-full rounded border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div className="flex items-center gap-3 md:self-end">
                  <button
                    onClick={handleVisualize}
                    className={
                      "px-5 py-2 rounded text-white transition transform " +
                      (isOptimizing
                        ? "bg-blue-500 opacity-90 cursor-wait"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500")
                    }
                    disabled={isOptimizing}
                    aria-busy={isOptimizing}
                    title={
                      isOptimizing ? "Optimizing..." : "Optimize Placement"
                    }
                  >
                    {isOptimizing ? (
                      <span className="inline-flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Optimizing...
                      </span>
                    ) : (
                      "Optimize Placement"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setPlacements(null);
                      setList([]);
                      setAiInsight(null);
                    }}
                    className="px-4 py-2 border rounded hover:shadow-sm active:scale-95 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-slate-400 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">2D Warehouse Layout</h3>
              <div className="mt-3">
                <LayoutCanvas data={placements} />
              </div>
              {aiInsight && (
                <div className="mt-4 rounded-lg bg-slate-900 p-4 text-slate-100 shadow-inner">
                  <p className="text-sm font-semibold tracking-wide uppercase text-slate-200">
                    AI Optimization Insight
                  </p>
                  {aiInsight.summary && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-100">
                      {aiInsight.summary}
                    </p>
                  )}
                  {Array.isArray(aiInsight.reassignments) &&
                    aiInsight.reassignments.length > 0 && (
                      <ul className="mt-3 space-y-2 text-xs">
                        {aiInsight.reassignments.map((rec) => (
                          <li
                            key={rec.sku_code}
                            className="flex flex-col gap-1"
                          >
                            <span>
                              <span className="font-semibold text-slate-50">
                                {rec.sku_code}
                              </span>{" "}
                              → Zone {rec.recommended_zone} (
                              {Math.round(Number(rec.confidence || 0) * 100)}
                              %)
                            </span>
                            {rec.reason && (
                              <span className="text-slate-200">
                                Reason: {rec.reason}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              )}
            </div>
          </section>
        </div>

        <SkuTable items={list} onRefresh={fetchList} />
      </main>
    </div>
  );
}
