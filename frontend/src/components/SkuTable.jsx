import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://smart-warehouse-aagw.onrender.com/api";

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

function formatValue(value, digits = 4) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return "0.0000";
  }
  return num.toFixed(digits);
}

export default function SkuTable({ items, onRefresh }) {
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
            onClick={() => onRefresh?.()}
            className="px-3 py-2 border rounded text-sm hover:shadow-sm transition"
          >
            Refresh
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
              <th className="p-3">Zone</th>
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
                        item.sku_code
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
                    <td className="p-3 align-top">{item.zone}</td>
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
