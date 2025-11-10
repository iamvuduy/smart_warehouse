import React, { useState } from "react";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://smart-warehouse-aagw.onrender.com/api";

function normalizeInputs(raw) {
  const safe = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const rf = safe(raw.f);
  const rw = safe(raw.w);
  const rs = safe(raw.s);
  const ri = safe(raw.i);

  // Always normalize to 0-1 scale based on max values
  const f = Math.min(1, rf / 200);
  const w = Math.min(1, rw / 20);
  const s = Math.min(1, rs / 50000);
  const i = Math.min(1, ri / 20);

  return { f, w, s, i };
}

function formatValue(value, digits = 4) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return "0.0000";
  }
  return num.toFixed(digits);
}

export default function SkuTable({ items, onRefresh, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    sku_code: "",
    product_name: "",
    f: "",
    w: "",
    s: "",
    i: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setDraft({
      sku_code: item.sku_code,
      product_name: item.product_name || "",
      f: item.f,
      w: item.w,
      s: item.s,
      i: item.i,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({ sku_code: "", product_name: "", f: "", w: "", s: "", i: "" });
  }

  async function handleSave() {
    if (!editingId) return;

    const payload = normalizeInputs(draft);
    const skuCode = (draft.sku_code || "").trim();
    if (!skuCode) {
      alert("SKU code is required");
      return;
    }

    setIsSaving(true);
    try {
      await axios.put(`${API_BASE}/sku/${editingId}`, {
        sku_code: skuCode,
        product_name: draft.product_name?.trim() || null,
        f: payload.f,
        w: payload.w,
        s: payload.s,
        i: payload.i,
      });
      await onRefresh?.();
      cancelEdit();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this SKU?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/sku/${id}`);
      onDelete?.(id); // Call cleanup before refresh
      await onRefresh?.();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Added SKU Details</h3>
          <p className="text-sm text-slate-500">
            All values are normalized to the 0-1 scale together with the
            priority score.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={
              "px-3 py-2 border rounded text-sm transition flex items-center gap-2 " +
              (isRefreshing
                ? "opacity-60 cursor-wait"
                : "hover:shadow-sm hover:bg-slate-50")
            }
          >
            {isRefreshing ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="p-3">Product Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">F (0-1)</th>
              <th className="p-3">W (0-1)</th>
              <th className="p-3">S (0-1)</th>
              <th className="p-3">I (0-1)</th>
              <th className="p-3">Priority</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <input
                          className="w-full p-2 border rounded"
                          value={draft.product_name}
                          onChange={(e) =>
                            setDraft({ ...draft, product_name: e.target.value })
                          }
                          placeholder="e.g., Laptop Dell XPS 13"
                        />
                      ) : (
                        <span className="text-slate-700">
                          {item.product_name || "-"}
                        </span>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <input
                          className="w-full p-2 border rounded"
                          value={draft.sku_code}
                          onChange={(e) =>
                            setDraft({ ...draft, sku_code: e.target.value })
                          }
                        />
                      ) : (
                        item.sku_code.replace(/^SKU/i, "")
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <input
                          className="w-full p-2 border rounded"
                          value={draft.f}
                          onChange={(e) =>
                            setDraft({ ...draft, f: e.target.value })
                          }
                          placeholder="e.g. 0.6"
                        />
                      ) : (
                        formatValue(item.f)
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <input
                          className="w-full p-2 border rounded"
                          value={draft.w}
                          onChange={(e) =>
                            setDraft({ ...draft, w: e.target.value })
                          }
                          placeholder="e.g. 0.4"
                        />
                      ) : (
                        formatValue(item.w)
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <input
                          className="w-full p-2 border rounded"
                          value={draft.s}
                          onChange={(e) =>
                            setDraft({ ...draft, s: e.target.value })
                          }
                          placeholder="e.g. 0.2"
                        />
                      ) : (
                        formatValue(item.s, 6)
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <input
                          className="w-full p-2 border rounded"
                          value={draft.i}
                          onChange={(e) =>
                            setDraft({ ...draft, i: e.target.value })
                          }
                          placeholder="e.g. 0.3"
                        />
                      ) : (
                        formatValue(item.i)
                      )}
                    </td>
                    <td className="p-3 align-top">
                      {formatValue(item.priority)}
                    </td>
                    <td className="p-3 align-top">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs disabled:opacity-60"
                            disabled={isSaving}
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 border rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="px-3 py-1 border rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs disabled:opacity-60"
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  No SKUs available. Add new items to see them here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
