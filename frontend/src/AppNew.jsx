import React, { useEffect, useState } from "react";
import axios from "axios";
import LayoutCanvas from "./components/LayoutCanvas";
import SkuTable from "./components/SkuTable";
import Toast from "./components/Toast";

// Use environment variable for API base URL (supports both local and production)
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export default function AppNew() {
  const [sku, setSku] = useState({
    sku_code: "",
    product_name: "",
    f: 0.0,
    w: 0.0,
    s: 0.0,
    i: 0.0,
  });
  const [list, setList] = useState([]);
  const [placements, setPlacements] = useState(() => {
    // Khôi phục placements từ localStorage khi load trang
    const saved = localStorage.getItem("warehousePlacements");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [optInstructions, setOptInstructions] = useState("");
  const [toast, setToast] = useState(null);

  // Lưu placements vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    if (placements) {
      localStorage.setItem("warehousePlacements", JSON.stringify(placements));
    }
  }, [placements]);

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
        product_name: sku.product_name,
        f: normalized.f,
        w: normalized.w,
        s: normalized.s,
        i: normalized.i,
      };
      await axios.post(`${API_BASE}/sku/add`, payload);
      setSku({ sku_code: "", product_name: "", f: 0, w: 0, s: 0, i: 0 });
      await fetchList();

      setToast({
        message: `✅ SKU "${payload.sku_code}" added successfully!`,
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      setToast({
        message: `❌ ${err?.response?.data?.detail || err.message}`,
        type: "error",
      });
    } finally {
      setIsAdding(false);
    }
  }

  async function handleVisualize() {
    if (list.length === 0) {
      setToast({
        message: "⚠️ Please add at least one SKU before optimizing placement",
        type: "warning",
      });
      return;
    }

    setIsOptimizing(true);
    setAiInsight(null);
    try {
      // First, call visualize to get basic layout with priority-based placement
      const res = await axios.get(`${API_BASE}/sku/visualize`);
      setPlacements(res.data);

      // Show optimization summary
      const counts = res.data.counts || {};
      const totalPlaced = Object.values(counts).reduce(
        (sum, count) => sum + count,
        0
      );

      const zoneSummary = Object.entries(counts)
        .map(([zone, count]) => {
          const zoneName =
            zone === "A"
              ? "High Priority"
              : zone === "B"
              ? "Medium-High Priority"
              : zone === "C"
              ? "Medium-Low Priority"
              : "Low Priority";
          return `Zone ${zone} (${zoneName}): ${count} items`;
        })
        .join("\n");

      // Show success toast
      setToast({
        message: `🎉 Optimization Complete!\n\nTotal SKUs placed: ${totalPlaced}\n\n${zoneSummary}\n\nSKUs have been assigned to zones based on their priority scores.`,
        type: "success",
        duration: 6000,
      });

      // Optionally, try AI optimization if instructions are provided
      if (optInstructions.trim()) {
        try {
          const aiRes = await axios.post(`${API_BASE}/sku/optimize`, {
            instructions: optInstructions.trim(),
          });
          setPlacements(aiRes.data);

          const summary = aiRes.data?.assistant_summary ?? null;
          const reassignments = Array.isArray(
            aiRes.data?.assistant_reassignments
          )
            ? aiRes.data.assistant_reassignments
            : [];

          if (summary || reassignments.length > 0) {
            setAiInsight({ summary, reassignments });
          }
        } catch (aiErr) {
          console.warn("AI optimization failed, using basic placement:", aiErr);
        }
      }
    } catch (err) {
      console.error("Optimization error:", err);
      setToast({
        message: `❌ Error optimizing placement\n\n${
          err?.response?.data?.detail || err.message
        }`,
        type: "error",
      });
    } finally {
      setIsOptimizing(false);
    }
  }

  async function resetToDemo() {
    const demo = [
      {
        sku_code: "SKU01",
        product_name: "Power Bank 10,000mAh",
        f: 180,
        w: 1,
        s: 300,
        i: 18,
      },
      {
        sku_code: "SKU02",
        product_name: "ASUS Laptop 15.6''",
        f: 60,
        w: 2,
        s: 5000,
        i: 10,
      },
      {
        sku_code: "SKU03",
        product_name: "Oishi Snack 40g",
        f: 200,
        w: 1,
        s: 80,
        i: 20,
      },
      {
        sku_code: "SKU04",
        product_name: "Stainless Steel Bottle 1L",
        f: 150,
        w: 1,
        s: 900,
        i: 14,
      },
      {
        sku_code: "SKU05",
        product_name: "Mini Vacuum Cleaner",
        f: 55,
        w: 4,
        s: 3500,
        i: 9,
      },
      {
        sku_code: "SKU06",
        product_name: "Men's Sneakers",
        f: 110,
        w: 2,
        s: 4000,
        i: 8,
      },
      {
        sku_code: "SKU07",
        product_name: "Shampoo 650ml",
        f: 160,
        w: 2,
        s: 1200,
        i: 19,
      },
      {
        sku_code: "SKU08",
        product_name: "Hand Sanitizer 500ml",
        f: 170,
        w: 2,
        s: 900,
        i: 20,
      },
      {
        sku_code: "SKU09",
        product_name: "Stainless Knife Set",
        f: 25,
        w: 3,
        s: 1800,
        i: 5,
      },
      {
        sku_code: "SKU10",
        product_name: "School Backpack",
        f: 70,
        w: 2,
        s: 4500,
        i: 12,
      },
      {
        sku_code: "SKU11",
        product_name: "Blender",
        f: 40,
        w: 5,
        s: 6000,
        i: 7,
      },
      {
        sku_code: "SKU12",
        product_name: "Cotton T-shirt",
        f: 140,
        w: 1,
        s: 450,
        i: 15,
      },
      {
        sku_code: "SKU13",
        product_name: "Textbook Grade 10",
        f: 180,
        w: 1,
        s: 700,
        i: 17,
      },
      {
        sku_code: "SKU14",
        product_name: "Wireless Gaming Mouse",
        f: 120,
        w: 1,
        s: 200,
        i: 13,
      },
      {
        sku_code: "SKU15",
        product_name: "Tissue Pack (10 packs)",
        f: 160,
        w: 2,
        s: 2500,
        i: 16,
      },
      {
        sku_code: "SKU16",
        product_name: "55-inch TV",
        f: 10,
        w: 18,
        s: 50000,
        i: 3,
      },
      {
        sku_code: "SKU17",
        product_name: "Induction Cooker",
        f: 15,
        w: 15,
        s: 38000,
        i: 4,
      },
      {
        sku_code: "SKU18",
        product_name: "Bedding Set",
        f: 50,
        w: 10,
        s: 25000,
        i: 7,
      },
      {
        sku_code: "SKU19",
        product_name: "WiFi Security Camera",
        f: 95,
        w: 1,
        s: 700,
        i: 12,
      },
      {
        sku_code: "SKU20",
        product_name: "Body Wash 850ml",
        f: 130,
        w: 2,
        s: 1500,
        i: 14,
      },
    ];
    try {
      setIsResetting(true);
      setAiInsight(null);

      let successCount = 0;
      let errorCount = 0;

      for (const it of demo) {
        try {
          await axios.post(`${API_BASE}/sku/add`, it);
          successCount++;
        } catch (err) {
          errorCount++;
          console.warn(
            `Failed to add ${it.sku_code}:`,
            err.response?.data?.detail || err.message
          );
        }
      }

      await fetchList();

      setToast({
        message: `✅ Demo Data Loaded!\n\nSuccessfully added: ${successCount} SKUs\nSkipped (already exists): ${errorCount} SKUs\n\nNow optimizing placement...`,
        type: "success",
        duration: 4000,
      });

      await handleVisualize();
    } catch (err) {
      console.error(err);
      setToast({
        message: `Error loading demo data: ${err.message || "Unknown error"}`,
        type: "error",
        duration: 5000,
      });
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

              <div>
                <label className="block text-sm text-slate-600">
                  Product Name
                </label>
                <input
                  required
                  value={sku.product_name}
                  onChange={(e) =>
                    setSku({ ...sku, product_name: e.target.value })
                  }
                  className="w-full p-3 border rounded mt-1"
                  placeholder="e.g., Laptop Dell XPS 13"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">
                    Outbound Freq.
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sku.f}
                      onChange={(e) =>
                        setSku({
                          ...sku,
                          f:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded mt-1"
                      placeholder="50"
                    />
                    <span className="text-sm text-slate-500 mt-1">/day</span>
                  </div>
                  <p className="text-xs text-slate-400">Range: 1-200</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Weight</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sku.w}
                      onChange={(e) =>
                        setSku({
                          ...sku,
                          w:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded mt-1"
                      placeholder="20"
                    />
                    <span className="text-sm text-slate-500 mt-1">kg</span>
                  </div>
                  <p className="text-xs text-slate-400">Range: 1-50</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Volume</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sku.s}
                      onChange={(e) =>
                        setSku({
                          ...sku,
                          s:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded mt-1"
                      placeholder="20"
                    />
                    <span className="text-sm text-slate-500 mt-1">cm³</span>
                  </div>
                  <p className="text-xs text-slate-400">Range: 1-100</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">
                    Inbound Freq.
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sku.i}
                      onChange={(e) =>
                        setSku({
                          ...sku,
                          i:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded mt-1"
                      placeholder="60"
                    />
                    <span className="text-sm text-slate-500 mt-1">/day</span>
                  </div>
                  <p className="text-xs text-slate-400">Range: 1-200</p>
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
                      localStorage.removeItem("warehousePlacements"); // Xóa dữ liệu đã lưu
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

              {/* Loading State */}
              {isOptimizing && (
                <div className="mt-4 flex flex-col items-center justify-center py-12 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <svg
                    className="animate-spin h-12 w-12 text-blue-600 mb-4"
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
                  <p className="text-lg font-semibold text-blue-900">
                    OpenAI is optimizing placement, please wait...
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Analyzing SKU properties and calculating optimal positions
                  </p>
                </div>
              )}

              {/* Layout Canvas */}
              {!isOptimizing && (
                <div className="mt-3">
                  <LayoutCanvas data={placements} />
                </div>
              )}

              {/* Placement Results */}
              {!isOptimizing &&
                placements &&
                placements.placements &&
                placements.placements.length > 0 && (
                  <div className="mt-4 rounded-lg bg-green-50 border-2 border-green-200 p-4">
                    <h4 className="font-semibold text-green-900 mb-3">
                      📦 Placement Results
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {placements.placements.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white p-3 rounded border border-green-200 hover:shadow-sm transition"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800">
                              {item.product_name || item.sku_code}
                            </div>
                            <div className="text-sm text-slate-600">
                              SKU: {item.sku_code} • Priority:{" "}
                              {item.priority?.toFixed(4)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-700 text-lg">
                              {item.position_id}
                            </div>
                            <div className="text-xs text-slate-500">
                              Zone {item.zone}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type || "success"}
          duration={toast.duration || 5000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
