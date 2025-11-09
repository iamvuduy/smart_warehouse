import React, { useEffect, useState } from 'react'
import axios from 'axios'
import LayoutCanvas from './components/LayoutCanvas'

const API_BASE = 'http://localhost:8000/api'

export default function App() {
  const [sku, setSku] = useState({ sku_code: '', f: 0.0, w: 0.0, s: 0.0, i: 0.0 })
  const [list, setList] = useState([])
  const [placements, setPlacements] = useState(null)

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    try {
      const res = await axios.get(`${API_BASE}/sku/list`)
      setList(res.data)
    } catch (err) { console.error(err) }
  }

  async function handleAdd(e) {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/sku/add`, sku)
      setSku({ sku_code: '', f: 0.0, w: 0.0, s: 0.0, i: 0.0 })
      fetchList()
    } catch (err) { alert(err?.response?.data?.detail || err.message) }
  }

  async function handleVisualize() {
    try {
      const res = await axios.get(`${API_BASE}/sku/visualize`)
      setPlacements(res.data)
    } catch (err) { console.error(err) }
  }

  async function resetToDemo() {
    const demo = [
      { sku_code: 'SKU001', f: 0.25, w: 0.4, s: 0.2, i: 0.3 },
      { sku_code: 'SKU002', f: 0.8, w: 0.7, s: 0.3, i: 0.5 },
      { sku_code: 'SKU003', f: 0.15, w: 0.2, s: 0.1, i: 0.2 }
    ]
    try {
      for (const it of demo) {
        try { await axios.post(`${API_BASE}/sku/add`, it) } catch (_) { }
      }
      await fetchList()
      await handleVisualize()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold">AI Warehouse Optimizer</h1>
        <p className="text-sm text-slate-600">Smart Storage Location Assignment (SLAP)</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
        <section className="col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Add New SKU</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm text-slate-600">SKU Name / ID</label>
              <input required value={sku.sku_code} onChange={e => setSku({...sku, sku_code: e.target.value})}
                className="w-full p-3 border rounded mt-1" placeholder="e.g., Electronics-012" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">Outbound Freq. (F)</label>
                <input type="number" min="0" max="1" step="0.01" value={sku.f} onChange={e => setSku({...sku, f: parseFloat(e.target.value||0)})} className="w-full p-2 border rounded mt-1" />
                <p className="text-xs text-slate-400">Range: 0-1</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Weight (W)</label>
                <input type="number" min="0" max="1" step="0.01" value={sku.w} onChange={e => setSku({...sku, w: parseFloat(e.target.value||0)})} className="w-full p-2 border rounded mt-1" />
                <p className="text-xs text-slate-400">Range: 0-1</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Volume (S)</label>
                <input type="number" min="0" max="1" step="0.01" value={sku.s} onChange={e => setSku({...sku, s: parseFloat(e.target.value||0)})} className="w-full p-2 border rounded mt-1" />
                <p className="text-xs text-slate-400">Range: 0-1</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Inbound Freq. (I)</label>
                <input type="number" min="0" max="1" step="0.01" value={sku.i} onChange={e => setSku({...sku, i: parseFloat(e.target.value||0)})} className="w-full p-2 border rounded mt-1" />
                <p className="text-xs text-slate-400">Range: 0-1</p>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded font-medium">+ Add SKU to List</button>
              <button type="button" onClick={resetToDemo} className="px-4 py-3 bg-slate-800 text-white rounded">Reset to Demo</button>
            </div>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-medium">SKU Priority List</h3>
            <p className="text-xs text-slate-500">Items are automatically sorted by the highest priority score.</p>
            <div className="overflow-auto max-h-64 mt-2">
              <table className="w-full text-sm">
                <thead className="text-slate-600 text-left">
                  <tr>
                    <th>SKU NAME</th>
                    <th>PRIORITY</th>
                    <th>ZONE</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(it => (
                    <tr key={it.id} className="border-t">
                      <td className="py-1">{it.sku_code}</td>
                      <td className="py-1">{it.priority}</td>
                      <td className="py-1">{it.zone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Warehouse Operations</h3>
              <p className="text-sm text-slate-500">Add SKUs and their properties, then click "Optimize Placement" to get AI-powered placement suggestions.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleVisualize} className="px-5 py-2 bg-blue-600 text-white rounded">Optimize Placement</button>
              <button onClick={() => { setPlacements(null); setList([]) }} className="px-4 py-2 border rounded">Clear</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">2D Warehouse Layout</h3>
            <div className="mt-3">
              <LayoutCanvas data={placements} />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import LayoutCanvas from './components/LayoutCanvas'

const API_BASE = 'http://localhost:8000/api'

export default function App() {
  const [sku, setSku] = useState({ sku_code: '', f: 0.0, w: 0.0, s: 0.0, i: 0.0 })
  const [list, setList] = useState([])
  const [placements, setPlacements] = useState(null)

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    try {
      const res = await axios.get(`${API_BASE}/sku/list`)
      setList(res.data)
    } catch (err) { console.error(err) }
  }

  async function handleAdd(e) {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/sku/add`, sku)
      setSku({ sku_code: '', f: 0.0, w: 0.0, s: 0.0, i: 0.0 })
      fetchList()
    } catch (err) { alert(err?.response?.data?.detail || err.message) }
  }

  async function handleVisualize() {
    try {
      const res = await axios.get(`${API_BASE}/sku/visualize`)
      setPlacements(res.data)
    } catch (err) { console.error(err) }
  }

  async function resetToDemo() {
    const demo = [
      { sku_code: 'SKU001', f: 0.25, w: 0.4, s: 0.2, i: 0.3 },
      { sku_code: 'SKU002', f: 0.8, w: 0.7, s: 0.3, i: 0.5 },
      { sku_code: 'SKU003', f: 0.15, w: 0.2, s: 0.1, i: 0.2 }
    ]
    try {
      for (const it of demo) {
        try { await axios.post(`${API_BASE}/sku/add`, it) } catch (_) { }
      }
      await fetchList()
      await handleVisualize()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold">AI Warehouse Optimizer</h1>
        <p className="text-sm text-slate-600">Smart Storage Location Assignment (SLAP)</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
        <section className="col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Add New SKU</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm text-slate-600">SKU Name / ID</label>
              <input required value={sku.sku_code} onChange={e => setSku({...sku, sku_code: e.target.value})}
                className="w-full p-3 border rounded mt-1" placeholder="e.g., Electronics-012" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">Outbound Freq. (F)</label>
                <input type="number" min="0" max="1" step="0.01" value={sku.f} onChange={e => setSku({...sku, f: parseFloat(e.target.value||0)})} className="w-full p-2 border rounded mt-1" />
                <p className="text-xs text-slate-400">Range: 0-1</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Weight (W)</label>
                <input type="number" min="0" max="1" step="0.01" value={sku.w} onChange={e => setSku({...sku, w: parseFloat(e.target.value||0)})} className="w-full p-2 border rounded mt-1" />
                <p className="text-xs text-slate-400">Range: 0-1</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Volume (S)</label>
                <input type="number" min="0" max="1" step="0.01" value={sku.s} onChange={e => setSku({...sku, s: parseFloat(e.target.value||0)})} className="w-full p-2 border rounded mt-1" />
                <p className="text-xs text-slate-400">Range: 0-1</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Inbound Freq. (I)</label>
                <input type="number" min="0" max="1" step="0.01" value={sku.i} onChange={e => setSku({...sku, i: parseFloat(e.target.value||0)})} className="w-full p-2 border rounded mt-1" />
                <p className="text-xs text-slate-400">Range: 0-1</p>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded font-medium">+ Add SKU to List</button>
              <button type="button" onClick={resetToDemo} className="px-4 py-3 bg-slate-800 text-white rounded">Reset to Demo</button>
            </div>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-medium">SKU Priority List</h3>
            <p className="text-xs text-slate-500">Items are automatically sorted by the highest priority score.</p>
            <div className="overflow-auto max-h-64 mt-2">
              <table className="w-full text-sm">
                <thead className="text-slate-600 text-left">
                  <tr>
                    <th>SKU NAME</th>
                    <th>PRIORITY</th>
                    <th>ZONE</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(it => (
                    <tr key={it.id} className="border-t">
                      <td className="py-1">{it.sku_code}</td>
                      <td className="py-1">{it.priority}</td>
                      <td className="py-1">{it.zone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Warehouse Operations</h3>
              <p className="text-sm text-slate-500">Add SKUs and their properties, then click "Optimize Placement" to get AI-powered placement suggestions.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleVisualize} className="px-5 py-2 bg-blue-600 text-white rounded">Optimize Placement</button>
              <button onClick={() => { setPlacements(null); setList([]) }} className="px-4 py-2 border rounded">Clear</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">2D Warehouse Layout</h3>
            <div className="mt-3">
              <LayoutCanvas data={placements} />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
  )
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import LayoutCanvas from "./components/LayoutCanvas";

const API_BASE = "http://localhost:8000/api";

export default function App() {
  const [sku, setSku] = useState({
    sku_code: "",
    f: 0.0,
    w: 0.0,
    s: 0.0,
    i: 0.0,
  });
  const [list, setList] = useState([]);
  const [placements, setPlacements] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    const res = await axios.get(`${API_BASE}/sku/list`);
    setList(res.data);
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/sku/add`, sku);
      setSku({ sku_code: "", f: 0.0, w: 0.0, s: 0.0, i: 0.0 });
      fetchList();
    } catch (err) {
      alert(err?.response?.data?.detail || err.message);
    }
  }

  async function handleVisualize() {
    const res = await axios.get(`${API_BASE}/sku/visualize`);
    setPlacements(res.data);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-bold">
          AI Smart Warehouse Optimization (SLAP)
        </h1>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        <section className="col-span-1 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Add SKU</h2>
          <form onSubmit={handleAdd} className="space-y-2">
            <input
              required
              value={sku.sku_code}
              onChange={(e) => setSku({ ...sku, sku_code: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="SKU ID"
            />
            <label className="block">
              F (0-1)
              <input
                type="number"
                step="0.01"
                value={sku.f}
                onChange={(e) =>
                  setSku({ ...sku, f: parseFloat(e.target.value || 0) })
                }
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block">
              W (0-1)
              <input
                type="number"
                step="0.01"
                value={sku.w}
                onChange={(e) =>
                  setSku({ ...sku, w: parseFloat(e.target.value || 0) })
                }
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block">
              S (0-1)
              <input
                type="number"
                step="0.01"
                value={sku.s}
                onChange={(e) =>
                  setSku({ ...sku, s: parseFloat(e.target.value || 0) })
                }
                className="w-full p-2 border rounded"
              />
            </label>
            <label className="block">
              I (0-1)
              <input
                type="number"
                step="0.01"
                value={sku.i}
                onChange={(e) =>
                  setSku({ ...sku, i: parseFloat(e.target.value || 0) })
                }
                className="w-full p-2 border rounded"
              />
            </label>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded">
                Add SKU
              </button>
              <button
                type="button"
                onClick={handleVisualize}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Visualize Layout
              </button>
            </div>
          </form>

          <div className="mt-4">
            <h3 className="font-semibold">SKU List</h3>
            <table className="w-full text-sm mt-2">
              <thead>
                <tr>
                  <th className="text-left">SKU</th>
                  <th>Priority</th>
                  <th>Zone</th>
                </tr>
  )
  }
              <tbody>
                {list.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td>{it.sku_code}</td>
                    <td>{it.priority}</td>
                    <td>{it.zone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Warehouse Layout</h2>
          <div className="canvas-box p-2">
            <LayoutCanvas data={placements} />
          </div>
        </section>
      </main>
    </div>
  );
}
